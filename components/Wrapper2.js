import { useState } from 'react';
import { NextReactP5Wrapper } from "@p5-wrapper/next";
import hl from "../constants/hl-gen";

export default function Wrapper2() {
    const [reloadKey, setReloadKey] = useState(0);
    const [showReload, setShowReload] = useState(false);

    const sketch = (p5) => {
        const high = hl();

        let angle;
        let lengthFactor = 0.65;
        let maxDepth;
        let rarityMap0;
        let maxDeptheName;
        let minBranchLength;
        let rarityMap1;
        let paletteColor;
        let fromColor;
        let toColor;
        let paletteName;
        const artworkWidth = 700;
        const artworkHeight = 700;

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

            // MIN BRANCH LENGTH 
            rarityMap1 = high.randomInt(1, 101);
            if (rarityMap1 > 0 && rarityMap1 < 20) {
                minBranchLength = 2;
            } else if (rarityMap1 >= 20 && rarityMap1 < 35) {
                minBranchLength = 3;
            } else if (rarityMap1 >= 35 && rarityMap1 < 50) {
                minBranchLength = 4;
            } else if (rarityMap1 >= 50 && rarityMap1 < 102) {
                minBranchLength = 5;
            }

            // Color Palette
            paletteColor = high.randomInt(0, 5);

            switch (paletteColor) {
                case 0:
                    fromColor = p5.color(0, 0, 0);
                    toColor = p5.color(255, 255, 255);
                    paletteName = "depression.";
                    break;
                case 1:
                    fromColor = p5.color(0, 50, 150);
                    toColor = p5.color(0, 200, 50);
                    paletteName = "acceptance.";
                    break;
                case 2:
                    fromColor = p5.color(46, 196, 182);
                    toColor = p5.color(255, 159, 0);
                    paletteName = "denial.";
                    break;
                case 3:
                    fromColor = p5.color(252, 191, 73);
                    toColor = p5.color(208, 0, 0);
                    paletteName = "revenge.";
                    break;
                case 4:
                    fromColor = p5.color(241, 91, 181);
                    toColor = p5.color(2, 195, 154);
                    paletteName = "bargaining.";
                    break;
                case 5:
                    fromColor = p5.color(217, 4, 41);
                    toColor = p5.color(255, 143, 163);
                    paletteName = "anger.";
                    break;
                default:
                    fromColor = p5.color(0, 50, 150);
                    toColor = p5.color(0, 200, 50);
                    paletteName = "acceptance.";
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

            p5.mouseMoved = () => {
                if (p5.mouseX > 0 && p5.mouseX < p5.width && p5.mouseY > 0 && p5.mouseY < p5.height) {
                    setShowReload(true);
                } else {
                    setShowReload(false);
                }
            };
        };
    };

    return (
        <div className="px-5 flex justify-items-start">
            <div className="items-center justify-center bg-white border border-zinc-200 shadow dark:bg-zinc-800 dark:border-zinc-700">
                <NextReactP5Wrapper key={reloadKey} sketch={sketch} />
            </div>
        </div>
    );
}
