import * as React from "react";
import styled from "styled-components";

import { Checkbox } from "semantic-ui-react";

export const SlideReveal = styled.div`
    overflow-y: hidden;
    max-height: ${(props: any) => props.open ? "500px" : "0"};
    transition: all 0.3s ease-in-out;
`;


export const ProcessSection: React.FC = (props: any) => {
    const { open, onOpenChange, label } = props;
    return (
        <div style={{ padding: "10px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <h3>{label}</h3>
                <Checkbox
                    toggle={true}
                    checked={open}
                    onChange={(_, data) => onOpenChange(Boolean(data.checked))}
                />
            </div>
            <SlideReveal open={open}>
                {props.children}
            </SlideReveal>
        </div>
    );
};
