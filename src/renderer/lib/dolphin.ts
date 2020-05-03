/**
 * We can tap into the Dolphin state by reading the log printed to stdout.
 * This will let us automate the recording.
 *
 * Dolphin will emit the following messages in following order:
 * [PLAYBACK_START_FRAME]: the frame playback will commence (defaults to -123 if omitted)
 * [GAME_END_FRAME]: the last frame of the game
 * [PLAYBACK_END_FRAME] this frame playback will end at (defaults to MAX_INT if omitted)
 * [CURRENT_FRAME] the current frame being played back
 * [NO_GAME] no more files in the queue
 */

import fs from "fs-extra";
import path from "path";

import { remote } from "electron";

import { obsConnection, OBSRecordingAction } from "@/lib/obs";
import { delay, getFilePath, isMacOrWindows } from "@/lib/utils";
import { toast } from "react-toastify";
import { store } from "@/store";
import { DolphinLauncher, DolphinPlaybackPayload, DolphinPlaybackStatus, DolphinQueueFormat, generateDolphinQueuePayload } from "@vinceau/slp-realtime";
import { onlyFilename } from "common/utils";
import { BehaviorSubject, from } from "rxjs";
import { concatMap, filter } from "rxjs/operators";

const defaultDolphinRecorderOptions = {
    record: false,
    recordAsOneFile: true,
    outputFilename: "",
    outputFolder: "ProjectClippi",
    gameEndDelayMs: 1000,
};

export type DolphinRecorderOptions = typeof defaultDolphinRecorderOptions;

export const getDolphinPath = (): string => {
    if (isMacOrWindows) {
        const appData = remote.app.getPath("appData");
        return path.join(appData, "Slippi Desktop App", "dolphin");
    }
    return "";
};

export const getDolphinExecutableName = (): string => {
    switch (process.platform) {
        case "win32":
            return "Dolphin.exe";
        case "darwin":
            return "Dolphin.app";
        default:
            return "dolphin-emu";
    }
};

const getDolphinExecutablePath = (parent?: string): string => {
    const dolphinPath = parent ? parent : getDolphinPath();
    const dolphinExec = path.join(dolphinPath, getDolphinExecutableName());
    if (process.platform === "darwin") {
        return path.join(dolphinExec, "Contents", "MacOS", "Dolphin");
    }
    return dolphinExec;
};

export class DolphinRecorder extends DolphinLauncher {
    private recordOptions: DolphinRecorderOptions;

    // We use this to track the original OBS filename format so we can restore it later
    private userFilenameFormat: string = "";

    private readonly currentJSONFileSource = new BehaviorSubject<string>("");
    public currentJSONFile$ = this.currentJSONFileSource.asObservable();

    private readonly currentBasenameSource = new BehaviorSubject<string>("");
    public currentBasename$ = this.currentBasenameSource.asObservable();

    public constructor(options?: any) {
        super(options);
        this.recordOptions = Object.assign({}, defaultDolphinRecorderOptions);
        this.output.playbackStatus$.pipe(
            // Only process if recording is enabled and OBS is connected
            filter(() => this.recordOptions.record && obsConnection.isConnected()),
            // Process the values synchronously one at time
            concatMap((payload) => from(this._handleDolphinPlayback(payload))),
        ).subscribe();
        this.dolphinQuit$.pipe(
            // Only process if recording is enabled and OBS is connected
            filter(() => this.recordOptions.record && obsConnection.isConnected()),
            concatMap(() => from(this._stopRecording())),
        ).subscribe();
    }

    public async recordJSON(comboFilePath: string, options?: Partial<DolphinRecorderOptions>): Promise<void> {
        this.recordOptions = Object.assign({}, defaultDolphinRecorderOptions, options);
        if (this.recordOptions.record) {
            // First store the current filename format so we can restore it later
            this.userFilenameFormat = await obsConnection.getFilenameFormat();
        }
        this.currentJSONFileSource.next(comboFilePath);
        super.loadJSON(comboFilePath);
    }

    private async _handleDolphinPlayback(payload: DolphinPlaybackPayload): Promise<void> {
        console.log(payload);
        switch (payload.status) {
            case DolphinPlaybackStatus.FILE_LOADED:
                const basename = path.basename(payload.data.path);
                await this._handleSetOBSFilename(basename);
                this.currentBasenameSource.next(basename);
                break;
            case DolphinPlaybackStatus.PLAYBACK_START:
                await this._startRecording();
                break;
            case DolphinPlaybackStatus.PLAYBACK_END:
                if (payload.data && payload.data.gameEnded) {
                    // Only delay if the game wasn't force quitted out
                    if (!payload.data.forceQuit) {
                        await delay(this.recordOptions.gameEndDelayMs);
                    }
                }
                const endAction = this.recordOptions.recordAsOneFile ? OBSRecordingAction.PAUSE : OBSRecordingAction.STOP;
                await obsConnection.setRecordingState(endAction);
                break;
            case DolphinPlaybackStatus.QUEUE_EMPTY:
                // Stop recording and quit Dolphin
                await this._stopRecording(true);
                break;
        }
    }

    private async _handleSetOBSFilename(filename: string): Promise<void> {
        // Return if recording is off, or if recording has already started
        if (!this.recordOptions.record || obsConnection.isRecording()) {
            return;
        }

        // Store the new filename here, defaulting to the original filename format
        let newFilename = this.userFilenameFormat;
        if (!this.recordOptions.recordAsOneFile) {
            // If we're recording as separate files use the SLP filename
            newFilename = onlyFilename(filename);
        } else if (this.recordOptions.outputFilename) {
            // If we're provided an output filename use that
            newFilename = this.recordOptions.outputFilename;
        }

        if (this.recordOptions.outputFolder) {
            newFilename = path.join(this.recordOptions.outputFolder, newFilename);
        }

        // Actually set the filename
        await obsConnection.setFilenameFormat(newFilename);
        return;
    }

    private async _startRecording(): Promise<void> {
        const startAction = this.recordOptions.recordAsOneFile ? OBSRecordingAction.UNPAUSE : OBSRecordingAction.START;
        const action = obsConnection.isRecording() ? startAction : OBSRecordingAction.START;
        await obsConnection.setRecordingState(action);
    }

    private async _stopRecording(killDolphin?: boolean) {
        this.currentBasenameSource.next("");
        if (obsConnection.isRecording()) {
            await obsConnection.setRecordingState(OBSRecordingAction.STOP);
        }
        // Restore the original user filename format
        await obsConnection.setFilenameFormat(this.userFilenameFormat);

        if (killDolphin && this.dolphin) {
            this.dolphin.kill();
        }
    }

}

const randomTempJSONFile = () => {
    const folder = remote.app.getPath("temp");
    const filename = `${Date.now()}_dolphin_queue.json`;
    return path.join(folder, filename);
};

export const dolphinRecorder = new DolphinRecorder();

const _openComboInDolphin = async (filePath: string, options?: Partial<DolphinRecorderOptions>) => {
    const { meleeIsoPath, dolphinPath } = store.getState().filesystem;
    const dolphinExec = getDolphinExecutablePath(dolphinPath);
    const dolphinExists = await fs.pathExists(dolphinExec);

    if (!dolphinExists) {
        throw new Error(`Dolphin executable doesn't exist at path: ${dolphinExec}`);
    }

    const meleeIsoExists = await fs.pathExists(meleeIsoPath);
    const dolphinSettings = {
        meleeIsoPath: meleeIsoExists ? meleeIsoPath : "",
        dolphinPath: dolphinExec,
        batch: meleeIsoExists,
    };
    dolphinRecorder.updateSettings(dolphinSettings);
    await dolphinRecorder.recordJSON(filePath, options);
};

export const openComboInDolphin = (filePath: string, options?: Partial<DolphinRecorderOptions>) => {
    _openComboInDolphin(filePath, options).catch(err => {
        console.error(err);
        if (isMacOrWindows) {
            toast("Error loading Dolphin. Download the Slippi Desktop App.", {autoClose: false, onClick: () => {
                window.open("https://slippi.gg/downloads");
            }});
        } else {
            toast("Error loading Dolphin. Build a Playback Dolphin with Slippi-FM-Installer and then set the Playback Path.", {autoClose: false, onClick: () => {
                window.open("https://github.com/project-slippi/Slippi-FM-installer/blob/master/README.md");
            }});
        }
    });
};

export const loadSlpFilesInDolphin = async (filenames: string[], options?: Partial<DolphinRecorderOptions>): Promise<void> => {
    const queue = filenames
        .filter(filename => path.extname(filename) === ".slp")
        .map(filename => ({path: filename}));
    console.log(queue);
    if (queue.length === 0) {
        return;
    }

    const payload = generateDolphinQueuePayload(queue);
    await loadPayloadIntoDolphin(payload, options);
};

const loadPayloadIntoDolphin = async (payload: string, options?: Partial<DolphinRecorderOptions>): Promise<void> => {
    const outputFile = randomTempJSONFile();
    await fs.writeFile(outputFile, payload);
    openComboInDolphin(outputFile, options);
};

export const loadQueueIntoDolphin = (options?: Partial<DolphinRecorderOptions>): void => {
    const { dolphinQueue, dolphinQueueOptions } = store.getState().tempContainer;
    const queue: DolphinQueueFormat = {
        ...dolphinQueueOptions,
        queue: dolphinQueue,
    };
    const payload = JSON.stringify(queue, undefined, 2);
    loadPayloadIntoDolphin(payload, options).catch(console.error);
};

export const saveQueueToFile = async (): Promise<void> => {
    const fileTypeFilters = [
        { name: "JSON files", extensions: ["json"] }
    ];
    const options = {
        filters: fileTypeFilters,
    };
    const p = await getFilePath(options, true);
    if (!p || p.length === 0) {
        console.error("Could not save queue because path is undefined");
        return;
    }
    const { dolphinQueue, dolphinQueueOptions } = store.getState().tempContainer;
    const queue: DolphinQueueFormat = {
        ...dolphinQueueOptions,
        queue: dolphinQueue,
    };
    const payload = JSON.stringify(queue, undefined, 2);
    return fs.writeFile(p[0], payload);
};
