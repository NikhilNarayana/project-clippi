import * as React from "react";
import path from "path";

import {
    Route,
    Switch,
    useHistory,
    useRouteMatch,
} from "react-router-dom";

import { ComboFilterSettings } from "@vinceau/slp-realtime";
import { useDispatch, useSelector } from "react-redux";
import { Button, Icon, Menu, Header, Table } from "semantic-ui-react";
import styled, { css } from "styled-components";

import { comboFilter } from "@/lib/realtime";
import { Dispatch, iRootState } from "@/store";
import { device } from "@/styles/device";
import { LabelledButton } from "../LabelledButton";
import { ComboFinder } from "./ComboFinder";
import { ComboForm } from "./ComboForm";
import { sp } from "@/lib/sounds";
import { getFilePath } from "@/lib/utils";

export const SettingsPage: React.FC<{
    showSettings: boolean;
    onClose: () => void;
}> = props => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const [activeItem, setActiveItem] = React.useState("bio");

    const handleItemClick = (_: any, { name }: any) => {
        history.push(`${path}/${name}`);
        setActiveItem(name);
    };
    const hiddenSettings = css`
    visibility: hidden;
    overflow: hidden;
    height: 0;
    `;
    const SettingsContainer = styled.div`
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        visibility: visible;
        overflow: auto;
        background-color: rgba(255, 255, 255, 1);
        z-index: 1;
        ${!props.showSettings && hiddenSettings}
    `;
    const Wrapper = styled.div`
    display: flex;
    `;
    const MenuColumn = styled.div`
    flex-basis: 100%;
    overflow: hidden;
    overflow-y: auto;
    height: 100vh;
    @media ${device.mobileL} {
        flex-basis: 30%;
    }
    `;
    const ContentColumn = styled.div`
    flex-basis: 0%;
    overflow: hidden;
    overflow-y: auto;
    height: 100vh;
    @media ${device.mobileL} {
        flex-basis: 70%;
    }
    & > div {
        padding-top: 50px;
        padding-right: 100px;
    }
    `;
    const StyledMenu = styled(Menu)`
    &&& {
        width: 100%;
        padding: 50px;
        a.item {
            & > i.icon {
                float: left;
                margin-right: 10px;
                margin-left: 0;
            }
        }
        @media ${device.mobileL} {
            padding-top: 20px;
            padding-left: 10px;
            padding-right: 10px;
        }
    }
    `;
    const CloseButton = styled.div`
        font-size: 25px;
        position: fixed;
        top: 20px;
        right: 40px;
    `;
    return (
        <SettingsContainer>
            <CloseButton>
                <LabelledButton onClick={props.onClose} title="Close">
                    <Icon name="close" />
                </LabelledButton>
            </CloseButton>
            <Wrapper>
                <MenuColumn>
                    <StyledMenu secondary={true} vertical={true}>
                        <Menu.Item header>Combo Settings</Menu.Item>
                        <Menu.Item
                            name="combo-finder"
                            active={activeItem === "combo-finder"}
                            onClick={handleItemClick}
                        ><Icon name="search" /> Combo Finder</Menu.Item>
                        <Menu.Item
                            name="combo-settings"
                            active={activeItem === "combo-settings"}
                            onClick={handleItemClick}
                        ><Icon name="filter" />Filter Options</Menu.Item>
                        <Menu.Item header>Action Settings</Menu.Item>
                        <Menu.Item
                            name="account-settings"
                            active={activeItem === "account-settings"}
                            onClick={handleItemClick}
                        ><Icon name="twitch" />Twitch Integration</Menu.Item>
                        <Menu.Item
                            name="sound-settings"
                            active={activeItem === "sound-settings"}
                            onClick={handleItemClick}
                        ><Icon name="volume down" />Sounds</Menu.Item>
                    </StyledMenu>
                </MenuColumn>
                <ContentColumn>
                    <div>
                        <Switch>
                            <Route path={`${path}/combo-finder`} component={PageSettingsProfile} />
                            <Route path={`${path}/combo-settings`} component={PageSettingsBilling} />
                            <Route path={`${path}/account-settings`} component={PageSettingsAccount} />
                            <Route path={`${path}/sound-settings`} component={SoundSettings} />
                        </Switch>
                    </div>
                </ContentColumn>
            </Wrapper>
        </SettingsContainer>
    );

    /*
    return (
        <SettingsContainer>
        <Container>
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                <h1>Settings</h1>
                <Button onClick={() => props.onClose()}><Icon name="close"/> Close</Button>
            </div>
        <StyledGrid>
            <Grid.Column width={4}>
                <Menu fluid vertical tabular>
                    <Menu.Item
                        name="combo-finder"
                        active={activeItem === "combo-finder"}
                        onClick={handleItemClick}
                    >Combo Finder</Menu.Item>
                    <Menu.Item
                        name="combo-settings"
                        active={activeItem === "combo-settings"}
                        onClick={handleItemClick}
                    />
                    <Menu.Item
                        name="account-settings"
                        active={activeItem === "account-settings"}
                        onClick={handleItemClick}
                    />
                </Menu>
            </Grid.Column>

            <Grid.Column stretched width={12}>
                    <Switch>
                        <Route path={`${path}/combo-finder`} component={PageSettingsProfile} />
                        <Route path={`${path}/combo-settings`} component={PageSettingsBilling} />
                        <Route path={`${path}/account-settings`} component={PageSettingsAccount} />
                    </Switch>
            </Grid.Column>
        </StyledGrid>
</Container>
</SettingsContainer>
    );
    */
};

/*
export const OldSettingsPage: React.FC<{
    showSettings: boolean;
}> = props => {
    return (
        <SettingsContainer>
            <h2>Settings</h2>

            <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <LinkContainer to={`${path}/profile`}>
                        ComboFinder
            </LinkContainer>
                    <LinkContainer to={`${path}/billing`}>
                        Combo Settings
            </LinkContainer>
                    <LinkContainer to={`${path}/account`}>
                        Account
            </LinkContainer>
                </div>

                <div>
                    <Switch>
                        <Route path={`${path}/profile`} component={PageSettingsProfile} />
                        <Route path={`${path}/billing`} component={PageSettingsBilling} />
                        <Route path={`${path}/account`} component={PageSettingsAccount} />
                    </Switch>
                </div>
            </div>
        </SettingsContainer>
    );
};
*/

const PageSettingsProfile = () => {
    return (
        <div><ComboFinder /></div>
    );
};

export const PageSettingsBilling = () => {
    const settings = useSelector((state: iRootState) => state.slippi.settings);
    const initial = comboFilter.updateSettings(JSON.parse(settings));
    const dispatch = useDispatch<Dispatch>();
    const onSubmit = (values: Partial<ComboFilterSettings>) => {
        const newValues = comboFilter.updateSettings(values);
        console.log(`updated combo filter with new values: ${newValues}`);
        const valueString = JSON.stringify(newValues);
        console.log(`updating redux store: ${valueString}`);
        dispatch.slippi.updateSettings(valueString);
    };
    return (
        <div>
            <ComboForm initialValues={initial} onSubmit={onSubmit} />
        </div>
    );
};

const PageSettingsAccount = () => {
    return (
        <div>Accounts</div>
    );
};



const SoundSettings = () => {
    const soundFiles = useSelector((state: iRootState) => state.filesystem.soundFiles);
    const sounds = sp.deserialize(soundFiles);
    const dispatch = useDispatch<Dispatch>();
    // const onSubmit = (values: Partial<ComboFilterSettings>) => {
    //     const newValues = comboFilter.updateSettings(values);
    //     console.log(`updated combo filter with new values: ${newValues}`);
    //     const valueString = JSON.stringify(newValues);
    //     console.log(`updating redux store: ${valueString}`);
    //     dispatch.slippi.updateSettings(valueString);
    // };
    const onChange = (f: any[]) => {
        console.log(`got back ${f}`);
        // const fl = [];
        for (const ff of f) {
            console.log(ff);
            sp.addSound(ff.name, ff.path);
            dispatch.filesystem.setSoundFiles(sp.serialize());
        }
        // console.log(f);
        // setFileValue(fl);

    };
    const onPlay = (name: string) => {
        sp.playSound(name);
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
    return (
        <div>
            <h1>Sound Settings</h1>
            <Button onClick={() => getSounds().catch(console.error)}>
                <Icon name="add" />
            <label>
                Add sounds
            {/* <input
                    style={{ display: "none" }}
                    type="file"
                    onChange={(e: any) => {
                        console.log([...e.target.files]);
                        onChange([...e.target.files]);
                    }}
                /> */}
            </label>
            </Button>
            <SoundTable onPlay={onPlay} sounds={sounds}/>
        </div>
    );
};

const SoundTable: React.FC<{
    sounds: Map<string, string>;
    onPlay: (name: string) => void;
}> = props => {
    const rows: JSX.Element[] = [];
    props.sounds.forEach((value, key) => {
        rows.push((
      <Table.Row key={value}>
        <Table.Cell>
            {key}
        </Table.Cell>
        <Table.Cell>
          {value}
        </Table.Cell>
        <Table.Cell><span onClick={() => props.onPlay(key)}>Play</span></Table.Cell>
        <Table.Cell>
Delete
        </Table.Cell>
      </Table.Row>
        ));
    });
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
