import React, { useState, useRef } from "react";
import { StatusBar } from "expo-status-bar";
import SensorFusionProvider, {
    useSensorFusion,
} from "react-native-sensor-fusion";
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    Dimensions,
    Button,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";
import { Context } from "expo-2d-context";
import * as FileSystem from "expo-file-system";

const Indicator = ({ isPressed, data }) => {
    const { ahrs } = useSensorFusion();
    const { heading, pitch, roll } = ahrs.getEulerAngles();
    //roll goes between -3.25 to 3.25
    //pitch goest between -1.75 to 1.75
    intPitch = pitch.toFixed(3);
    intRoll = roll.toFixed(3);
    const newData = { x: intPitch, y: intRoll };
    if (isPressed === true) {
        data.current = [...data.current, newData];
    }

    // <Text>
    // Heading: {toDegrees(heading)}°{"\n"}
    // Pitch: {pitch}°{"\n"}
    // Roll: {roll}°{"\n"}
    // Compass: {toDegrees(compass)}°{"\n"}
    // </Text>
};

const GesturePath = ({ path, color, ref }) => {
    const { width, height } = Dimensions.get("window");
    const limit = width * 0.9;
    const xvals = path.map((p) => p.x);
    const yvals = path.map((p) => p.y);
    const xmin = Math.min(...xvals);
    const xmax = Math.max(...xvals);
    const ymin = Math.min(...yvals);
    const ymax = Math.max(...yvals);
    const xrange = xmax - xmin;
    const yrange = ymax - ymin;
    const points = path
        .map(
            (p) =>
                `${(((p.x - xmin) / xrange) * limit).toFixed(3)},${(
                    ((p.y - ymin) / yrange) *
                    limit
                ).toFixed(3)}`
        )
        .join(" ");
    console.log(points);

    return (
        <Svg
            ref={ref}
            height={limit}
            width={limit}
            style={{
                backgroundColor: "white",
                borderRadius: 10,
                borderColor: "black",
                borderWidth: 1,
                width: 100,
                height: 100,
            }}
        >
            <Polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="2"
            />
        </Svg>
    );
};

export default function App() {
    const [isPressed, setIsPressed] = useState(false);
    const sensorData = useRef([]);
    const svgRef = useRef();

    const deleteData = () => {
        sensorData.current = [];
    };

    const handlePressIn = () => {
        setIsPressed(true);
    };

    const handlePressOut = () => {
        setIsPressed(false);
    };

    const savePress = async () => {
        const canvas = new Context(new globalThis.HTMLCanvasElement(100, 100));
        const svgData = await svgRef.current.toDataURL();
        const img = new globalThis.Image();
        img.onload = () => {
            canvas.drawSvg(img, 0, 0, 100, 100);
            canvas.canvas.toBlob(async (blob) => {
                const filePath =
                    FileSystem.documentDirectory + "my-svg-file.png";
                await FileSystem.writeAsStringAsync(filePath, blob, {
                    encoding: FileSystem.EncodingType.Base64,
                });
                console.log("SVG file saved to " + filePath);
            });
        };
        img.src = svgData;
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.drawingBox}>
                <GesturePath
                    path={sensorData.current}
                    color="#000000"
                    ref={svgRef}
                />
            </View>
            <View style={styles.sensorText}>
                <SensorFusionProvider>
                    <Indicator
                        isPressed={isPressed}
                        data={sensorData}
                    />
                </SensorFusionProvider>
            </View>
            <View style={styles.sensorText}>
                <TouchableWithoutFeedback
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View
                        style={{
                            backgroundColor: isPressed ? "#19229e" : "#5cc8e9",
                            padding: 40,
                            borderRadius: 10,
                            margin: 10,
                        }}
                    >
                        <Text>Draw</Text>
                    </View>
                </TouchableWithoutFeedback>
                <View>
                    <Button
                        title="Delete"
                        onPress={deleteData}
                    ></Button>
                    <Button
                        title="Save"
                        onPress={savePress}
                    ></Button>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    sensorText: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    drawingBox: {
        flex: 1,
        backgroundColor: "red",
        alignItems: "center",
        justifyContent: "flex-start",
        margin: 50,
    },
});
