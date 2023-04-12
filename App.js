import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import SensorFusionProvider, {
    useSensorFusion,
    useCompass,
    toDegrees,
} from "react-native-sensor-fusion";
import {
    StyleSheet,
    Text,
    View,
    TouchableWithoutFeedback,
    Dimensions,
} from "react-native";
import Svg, { Polyline } from "react-native-svg";

const sensorData = [];
// const Indicator = (props) => {
//     const { isPressed } = props;
//     const { ahrs } = useSensorFusion();
//     const { x, y, z, w } = ahrs.toVector();
//     const newData = { x: z, y: x };
//     if (isPressed === true) {
//         sensorData.push(newData);
//         console.log(sensorData);
//     }
//     return (
//         <Text>
//             x: {x}
//             {"\n"}
//             y: {y}
//             {"\n"}
//             z: {z}
//             {"\n"}
//         </Text>
//     );
// };
const Indicator = (props) => {
    const { isPressed } = props;
    const { ahrs } = useSensorFusion();
    const { heading, pitch, roll } = ahrs.getEulerAngles();
    const compass = useCompass();
    const newData = { x: pitch, y: roll };
    if (isPressed === true) {
        sensorData.push(newData);
        console.log(sensorData);
    }
    return (
        <Text>
            Heading: {toDegrees(heading)}°{"\n"}
            Pitch: {pitch}°{"\n"}
            Roll: {roll}°{"\n"}
            Compass: {toDegrees(compass)}°{"\n"}
        </Text>
    );
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
                `${((p.x - xmin) / xrange) * limit},${
                    ((p.y - ymin) / yrange) * limit
                }`
        )
        .join(" ");

    return (
        <Svg
            height={limit}
            width={limit}
            // viewBox={`${limit / 2} ${limit / 2} ${limit} ${limit}`}
            style={{ backgroundColor: "blue" }}
        >
            <Polyline
                points={points}
                fill="none"
                stroke="red"
                strokeWidth="2"
            />
        </Svg>
    );
};

export default function App() {
    const [isPressed, setIsPressed] = useState(false);
    const [data, setData] = useState({
        labels: ["label"],
        datasets: [
            {
                data: [{ x: 0, y: 0 }],
            },
        ],
    });

    const handlePressIn = () => {
        setIsPressed(true);
        setData(sensorData);
    };

    const handlePressOut = () => {
        setIsPressed(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="auto" />
            <View style={styles.drawingBox}>
                <GesturePath
                    path={sensorData}
                    color="green"
                />
            </View>
            <View style={styles.sensorText}>
                <SensorFusionProvider>
                    <Indicator isPressed={isPressed} />
                </SensorFusionProvider>
            </View>
            <View style={styles.sensorText}>
                <TouchableWithoutFeedback
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <View
                        style={{
                            backgroundColor: isPressed ? "blue" : "red",
                            padding: 50,
                        }}
                    >
                        {/* Your button contents */}
                    </View>
                </TouchableWithoutFeedback>
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
    },
});
