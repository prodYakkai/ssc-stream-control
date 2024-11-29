/*
 * File: randomColor.ts
 * Project: srs-key-control
 * -----
 * Copyright (C) 2024 Shengming Yuan - All rights reserved.
 * 
 * You may use, distribute and modify this code under the terms of the Apache License 2.0 license.
 * 
 * You should have received a copy of the Apache License 2.0 License along with this program.
 * If not, see https://www.apache.org/licenses/LICENSE-2.0.
 * 
 */

const randomInteger = (max: number)=> {
    return Math.floor(Math.random()*(max + 1));
}

const randomRgbColor = () => {
    return {
        red: randomInteger(255) / 255,
        green: randomInteger(255) / 255,
        blue: randomInteger(255) / 255,
    }
}

export default randomRgbColor;