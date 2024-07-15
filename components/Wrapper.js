import { useContext } from 'react';
import { DataContext } from "../components/DataContext";
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import hl from '../constants/hl-gen2';

export function sketch(p5, userData1, setData, cata, setCata) {

    const high = hl(userData1)

    let angle;
    let lengthFactor = 0.65;

    //let maxDepth = 10;
    let maxDepth;
    let rarityMap0;
    let maxDeptheName;

    //let minBranchLength = 2;
    let minBranchLength;
    let rarityMap1;

    //colors
    let paletteColor;
    let fromColor;
    let toColor;
    let paletteName;
    //colors

    const artworkWidth = 700;
    const artworkHeight = 700;
    let otherdata = {};

    p5.setup = () => {
        p5.createCanvas(artworkWidth, artworkHeight);
        angle = p5.PI / 4;
        p5.noLoop();
        p5.frameRate(60);
        p5.pixelDensity(1);
        p5.resizeCanvas(artworkWidth, artworkHeight);

        // MAX DEPTH 
        rarityMap0 = high.randomInt(1, 101);
        if (rarityMap0 > 0 && rarityMap0 < 35) {
            maxDepth = 10;
            maxDeptheName = "X";
        } else if (rarityMap0 >= 35 && rarityMap0 < 50) {
            maxDepth = 30;
            maxDeptheName = "XXX";
        } else if (rarityMap0 >= 50 && rarityMap0 < 75) {
            maxDepth = 50;
            maxDeptheName = "L";
        } else if (rarityMap0 >= 75 && rarityMap0 < 102) {
            maxDepth = 100;
            maxDeptheName = "C";
        }
        // MAX DEPTH 


        // MIN BRANCH LENGTH 
        rarityMap1 = high.randomInt(1, 101);
        if (rarityMap1 > 0 && rarityMap1 < 20) {
            minBranchLength = 2;
        } else if (rarityMap1 >= 20 && rarityMap1 < 45) {
            minBranchLength = 3;
        } else if (rarityMap1 >= 45 && rarityMap1 < 70) {
            minBranchLength = 4;
        } else if (rarityMap1 >= 70 && rarityMap1 < 102) {
            minBranchLength = 5;
        }
        // MIN BRANCH LENGTH

        paletteColor = high.randomInt(0, 5);

        switch (paletteColor) {
            case 0:
                fromColor = p5.color(0, 0, 0);
                toColor = p5.color(255, 255, 255);
                paletteName = "Depression";
                break;
            case 1:
                fromColor = p5.color(0, 50, 150);
                toColor = p5.color(0, 200, 50);
                paletteName = "Acceptance";
                break;
            case 2:
                fromColor = p5.color(46, 196, 182);
                toColor = p5.color(255, 159, 0);
                paletteName = "Denial";
                break;
            case 3:
                fromColor = p5.color(252, 191, 73);
                toColor = p5.color(208, 0, 0);
                paletteName = "Revenge";
                break;
            case 4:
                fromColor = p5.color(241, 91, 181);
                toColor = p5.color(2, 195, 154);
                paletteName = "Bargaining";
                break;
            case 5:
                fromColor = p5.color(217, 4, 41);
                toColor = p5.color(255, 143, 163);
                paletteName = "Anger";
                break;
            default:
                fromColor = p5.color(0, 50, 150);
                toColor = p5.color(0, 200, 50);
                paletteName = "Acceptance";
                break;
        }
    };

    p5.draw = () => {
        p5.background(0);
        let gradientFactor = 0.1;

        function drawBranch(x, y, len, angle, depth) {
            if (depth > maxDepth) return;
            let endX = x + len * p5.cos(angle);
            let endY = y + len * p5.sin(angle);
            let col = p5.lerpColor(fromColor, toColor, p5.noise(x * gradientFactor, y * gradientFactor));
            p5.stroke(col);
            p5.strokeWeight(p5.map(len, minBranchLength, 100, 0.5, 4));
            p5.line(x, y, endX, endY);

            if (len > minBranchLength) {
                for (let i = 0; i < 2; i++) {
                    let newLen = len * lengthFactor * high.random(0.7, 1.3);
                    let newAngle = angle + (high.random() > 0.5 ? 1 : -1) * high.random(p5.PI / 10, p5.PI / 4);
                    drawBranch(endX, endY, newLen, newAngle, depth + 1);
                }
            }
        }

        for (let i = 0; i < 5; i++) {
            let xOffset = p5.width / 10;
            let yOffset = p5.height / 100;
            let startX = p5.width / 2 + high.random(-xOffset, xOffset);
            let startY = p5.height - yOffset;
            let trunkLength = high.randomInt(50, 150);
            drawBranch(startX, startY, trunkLength, -p5.PI / 2, 0);
        }

        // TRAITS
        let traits = {
            "Palette": paletteName,
            "BranchLength": minBranchLength,
            "Depth": maxDeptheName,
        };

        let name = `TreeVerse #${userData1.userData?.tokenId}`;

        let description =
            `TreeVerse is a 9999 editions generative art collection of on the Mint Blockchain. It features a variety of intricate tree designs with unique traits.`;

        otherdata = {
            "name": name,
            "description": description,
            "attributes": traits
        }

        if (cata == false) {
            setData(otherdata);
            setCata(true);
        }
    };
}

export default function Wrapper(userData, dataRef) {
    const userData1 = userData
    const { data, setData, cata, setCata } = useContext(DataContext);

    if (!userData || !userData.userData) {

        return (
            <div className="container mx-auto px-4 flex items-center justify-center">

            </div>
        );
    }

    return (
        //style={{ display: 'none' }}
        <div className="container mx-auto px-4 flex items-center justify-center" style={{ display: 'none' }} >
            <NextReactP5Wrapper sketch={(p5) => sketch(p5, userData1, setData, cata, setCata)} />
        </div>
    );
}