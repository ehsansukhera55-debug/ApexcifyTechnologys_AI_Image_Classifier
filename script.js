// 1. YOUR MODEL LINK (Replace this with your own link from Teachable Machine)
const URL = "https://teachablemachine.withgoogle.com/models/V0OG8Kmn7/";

let model, webcam, labelContainer, maxPredictions;

/**
 * Initializes the AI model and the webcam
 */
async function init() {
    try {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // Show the scanning animation line
        const scanLine = document.querySelector('.scan-line');
        if (scanLine) scanLine.style.display = 'block';

        // Load the model and metadata
        console.log("Loading AI Model...");
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        const flip = true; // whether to flip the webcam
        webcam = new tmImage.Webcam(400, 400, flip); 
        
        console.log("Requesting Camera Access...");
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        
        // Start the loop
        window.requestAnimationFrame(loop);

        // Append webcam canvas to the DOM
        const container = document.getElementById("webcam-container");
        container.innerHTML = ""; // Clear "Loading..." text if any
        container.appendChild(webcam.canvas);

        // Prepare the UI progress bars
        labelContainer = document.getElementById("label-container");
        labelContainer.innerHTML = ""; // Clear existing placeholders
        
        for (let i = 0; i < maxPredictions; i++) {
            const row = document.createElement("div");
            row.className = "prediction-row";
            row.innerHTML = `
                <div class="label-text">
                    <span class="class-name">Class ${i+1}</span>
                    <span class="percentage">0%</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" id="bar-${i}"></div>
                </div>
            `;
            labelContainer.appendChild(row);
        }

        console.log("System Ready.");

    } catch (error) {
        console.error("Initialization failed:", error);
        alert("Camera Error: Please ensure you are using a Local Server (like VS Code Live Server) and have granted camera permissions.");
    }
}

/**
 * Continuous loop to update the webcam and run predictions
 */
async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

/**
 * Runs the current webcam frame through the model and updates the UI
 */
async function predict() {
    // Prediction can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction = prediction[i].className;
        const probability = (prediction[i].probability * 100).toFixed(0);
        
        // Find the specific row for this class
        const row = labelContainer.childNodes[i];
        if (!row) continue;

        // Update Label Text
        row.querySelector(".class-name").innerText = classPrediction;
        row.querySelector(".percentage").innerText = probability + "%";
        
        // Update Progress Bar Width
        const bar = row.querySelector(".bar-fill");
        bar.style.width = probability + "%";

        // UI Feedback: Change color/glow if confidence is high (>85%)
        if (probability > 85) {
            bar.style.background = "linear-gradient(90deg, #4facfe 0%, #00f2fe 100%)";
            bar.style.boxShadow = "0 0 10px rgba(0, 242, 254, 0.7)";
        } else {
            bar.style.background = "rgba(255, 255, 255, 0.3)";
            bar.style.boxShadow = "none";
        }
    }
}