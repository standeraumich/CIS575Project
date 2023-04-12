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
import * as MediaLibrary from "expo-media-library";
import { captureRef } from "react-native-view-shot";

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

const GesturePath = ({ path, color }) => {
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
            height={limit}
            width={limit}
            style={{
                backgroundColor: "white",
                borderRadius: 10,
                borderColor: "black",
                borderWidth: 1,
                width: { limit },
                height: { limit },
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
    const [status, requestPermission] = MediaLibrary.usePermissions();

    if (status === null) {
        requestPermission();
    }
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

    const onSaveImageAsync = async () => {
        const { width, height } = Dimensions.get("window");
        try {
            const localUri = await captureRef(svgRef, {
                height: width,
                width: width,
                quality: 1,
            });

            await MediaLibrary.saveToLibraryAsync(localUri);
            if (localUri) {
                alert("Saved!");
            }
        } catch (e) {
            console.log(e);
        }
    };
    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View
                ref={svgRef}
                style={styles.drawingBox}
            >
                <GesturePath
                    path={sensorData.current}
                    color="#000000"
                />
            </View>
            <View>
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
                <View style={styles.buttonGroup}>
                    <View style={styles.button}>
                        <Button
                            color="#ff7300"
                            title="Delete"
                            onPress={deleteData}
                            style={styles.button}
                        />
                    </View>
                    <View style={styles.button}>
                        <Button
                            color="#ff7300"
                            title="Save"
                            onPress={onSaveImageAsync}
                            style={styles.button}
                        />
                    </View>
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
    buttonGroup: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
    },
    button: {
        margin: 60,
        padding: 10,
    },
});
