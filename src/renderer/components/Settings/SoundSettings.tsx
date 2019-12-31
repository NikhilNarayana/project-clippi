import * as React from "react";
import path from "path";

import { useDispatch, useSelector } from "react-redux";
import { Button, Icon, Table } from "semantic-ui-react";

import { Dispatch, iRootState } from "@/store";
import { sp } from "@/lib/sounds";
import { getFilePath } from "@/lib/utils";
import styled from "styled-components";
import { shell } from "electron";


export const SoundSettings: React.FC = () => {
    const soundFiles = useSelector((state: iRootState) => state.filesystem.soundFiles);
    const sounds = sp.deserialize(soundFiles);
    const dispatch = useDispatch<Dispatch>();
    const onPlay = (name: string) => {
        const filePath = sp.getSoundPath(name);
        if (filePath) {
            shell.openItem(filePath);
        }
    };
    const getSounds = async () => {
        const p = await getFilePath({
            filters: [{ name: "Audio files", extensions: ["mp3", "wav"] }],
        }, false);
        if (p) {
            const name = path.basename(p);
            sp.addSound(name, p);
            dispatch.filesystem.setSoundFiles(sp.serialize());
        }
    };
    const removeSound = (name: string) => {
        sp.removeSound(name);
        dispatch.filesystem.setSoundFiles(sp.serialize());
    };
    const Buttons = styled.div`
    margin-bottom: 10px;
    `;
    return (
        <div>
            <h2>Sounds</h2>
            <Buttons>
                <Button onClick={() => getSounds().catch(console.error)}>
                    <Icon name="add" />
                    Add sound
            </Button>
            </Buttons>
            <SoundTable onPlay={onPlay} onRemove={removeSound} sounds={sounds} />
        </div>
    );
};

const SoundRow: React.FC<{
    name: string;
    path: string;
    onPlay: () => void;
    onRemove: () => void;
}> = props => {

    return (
        <Table.Row key={props.path}>
            <Table.Cell>
                {props.name}
            </Table.Cell>
            <Table.Cell>
                {props.path}
            </Table.Cell>
            <Table.Cell>
                <span onClick={props.onPlay}><Icon name="play" /></span>
            </Table.Cell>
            <Table.Cell>
                <span onClick={props.onRemove}><Icon name="trash" /></span>
            </Table.Cell>
        </Table.Row>
    );
}

const SoundTable: React.FC<{
    sounds: { [name: string]: string};
    onPlay: (name: string) => void;
    onRemove: (name: string) => void;
}> = props => {
    const rows: JSX.Element[] = [];
    for (const [key, value] of Object.entries(props.sounds)) {
        rows.push((
            <SoundRow
                key={`${value}--${key}`}
                name={key}
                path={value}
                onPlay={() => props.onPlay(key)}
                onRemove={() => props.onRemove(key)}
            />
        ));
    };
    return (
        <div>
            <Table celled padded>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell singleLine>Name</Table.HeaderCell>
                        <Table.HeaderCell>File Path</Table.HeaderCell>
                        <Table.HeaderCell>Play</Table.HeaderCell>
                        <Table.HeaderCell>Delete</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {rows}
                </Table.Body>
            </Table>
        </div>
    );
};
