import React from "react";

import { hot } from "react-hot-loader/root";

import { HashRouter as Router, Redirect, Route, Switch } from "react-router-dom";
import { ThemeProvider } from "styled-components";

import { History } from "@/components/History";
import { darkTheme, GlobalStyle, lightTheme, ThemeManager, ThemeMode, useTheme } from "@/styles";
import { MainView } from "@/views/main/MainView";
import { SettingsView } from "@/views/settings/SettingsView";

const App: React.FC = () => {
    const theme = useTheme();
    return (
        <div className={theme.themeName}>
            <History />
            <ThemeProvider theme={theme.themeName === ThemeMode.LIGHT ? lightTheme : darkTheme}>
                <GlobalStyle />
                <Switch>
                    <Route path="/main" component={MainView} />
                    <Route path="/settings" component={SettingsView} />
                    <Route exact path="/">
                        <Redirect to="/main" />
                    </Route>
                </Switch>
            </ThemeProvider>
        </div>
    );
};

const ThemedApp: React.FC = () => {
    // ThemedManager must be declared and instantiated before useTheme() is called
    return (
        <ThemeManager>
            <Router>
                <App />
            </Router>
        </ThemeManager>
    );
};

export default hot(ThemedApp);
