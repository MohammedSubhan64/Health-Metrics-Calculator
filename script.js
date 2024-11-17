
// Dark Mode Toggle
const toggleButton = document.getElementById("toggle-theme");
toggleButton.addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");

    if (document.body.classList.contains("dark-mode")) {
        toggleButton.innerText = "Switch to Light Mode";
    } else {
        toggleButton.innerText = "Switch to Dark Mode";
    }
});

document.getElementById("enableBFPWHR").addEventListener("change", function () {
    const optionalInputs = document.getElementById("optionalInputs");
    if (this.checked) {
        optionalInputs.style.display = "block";
    } else {
        optionalInputs.style.display = "none";
    }
});

// Health Form Submit
document.getElementById("healthForm").addEventListener("submit", function (event) {
    event.preventDefault();

    let weight = parseFloat(document.getElementById("weight").value);
    let height = parseFloat(document.getElementById("height").value) / 100; // Convert cm to m
    let age = parseInt(document.getElementById("age").value);
    let gender = document.getElementById("gender").value;
    let activity = document.getElementById("activity").value;

    let waist = parseFloat(document.getElementById("waist").value);
    let neck = parseFloat(document.getElementById("neck").value);
    let hip = parseFloat(document.getElementById("hip").value);
    let includeBFPWHR = document.getElementById("enableBFPWHR").checked;

    // Calculate BMI
    let bmi = weight / (height * height);
    let bmiCategory = getBMICategory(bmi);

    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = (10 * weight) + (6.25 * (height * 100)) - (5 * age);
    if (gender === "male") {
        bmr += 5;
    } else {
        bmr -= 161;
    }

    // Adjust BMR for activity level
    const activityMultiplier = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725
    };
    bmr *= activityMultiplier[activity];

    // Optional: Calculate BFP and WHR if selected
    let bfp = null;
    let whr = null;
    let bfpRisk = "";
    let whrRisk = "";

    if (includeBFPWHR && waist > 0 && neck > 0) {
        if (gender === "male") {
            bfp = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height * 100)) - 450;
        } else {
            bfp = 495 / (1.29579 - 0.35004 * Math.log10(waist + hip - neck) + 0.22100 * Math.log10(height * 100)) - 450;
        }
        if (hip > 0) {
            whr = waist / hip;
        }

        // BFP Risk Categories
        if (gender === "male") {
            if (bfp < 6) {
                bfpRisk = "Low risk";
            } else if (bfp < 25) {
                bfpRisk = "Normal";
            } else {
                bfpRisk = "High risk";
            }
        } else {
            if (bfp < 16) {
                bfpRisk = "Low risk";
            } else if (bfp < 32) {
                bfpRisk = "Normal";
            } else {
                bfpRisk = "High risk";
            }
        }

        // WHR Risk Categories
        if (gender === "male") {
            if (whr < 0.90) {
                whrRisk = "Normal";
            } else {
                whrRisk = "High risk";
            }
        } else {
            if (whr < 0.85) {
                whrRisk = "Normal";
            } else {
                whrRisk = "High risk";
            }
        }
    }

    // Display Results
    document.getElementById("bmiResult").innerHTML = `<strong>BMI:</strong> ${bmi.toFixed(2)} - ${bmiCategory}`;
    document.getElementById("bmrResult").innerHTML = `<strong>BMR:</strong> ${bmr.toFixed(2)} kcal/day`;

    if (includeBFPWHR) {
        if (bfp !== null) {
            document.getElementById("bfpResult").innerHTML = `<strong>Body Fat Percentage (BFP):</strong> ${bfp.toFixed(2)}% <span class="${getRiskClass(bfpRisk)}">${bfpRisk}</span>`;
        } else {
            document.getElementById("bfpResult").innerHTML = '';
        }

        if (whr !== null) {
            document.getElementById("whrResult").innerHTML = `<strong>Waist-to-Hip Ratio (WHR):</strong> ${whr.toFixed(2)} <span class="${getRiskClass(whrRisk)}">${whrRisk}</span>`;
        } else {
            document.getElementById("whrResult").innerHTML = '';
        }
    } else {
        document.getElementById("bfpResult").innerHTML = '';
        document.getElementById("whrResult").innerHTML = '';
    }

    // Recommendations
    document.getElementById("recommendations").innerHTML = generateRecommendations(bmi, bfp, gender);
});

// BMI Category
function getBMICategory(bmi) {
    if (bmi < 18.5) {
        return "Underweight";
    } else if (bmi < 24.9) {
        return "Normal weight";
    } else if (bmi < 29.9) {
        return "Overweight";
    } else {
        return "Obesity";
    }
}

// Get Risk Class
function getRiskClass(risk) {
    if (risk === "Normal") {
        return "normal-risk";
    } else if (risk === "High risk") {
        return "high-risk";
    } else {
        return "low-risk";
    }
}

// Recommendations based on BMI and BFP
function generateRecommendations(bmi, bfp, gender) {
    let recommendationText = "";
    if (bmi < 18.5) {
        recommendationText += "<div class='recommendation underweight'>You are underweight. Consider gaining weight through a healthy diet and strength training.</div>";
    } else if (bmi < 24.9) {
        recommendationText += "<div class='recommendation normal-weight'>You have a normal weight. Keep up your healthy lifestyle!</div>";
    } else if (bmi < 29.9) {
        recommendationText += "<div class='recommendation overweight'>You are overweight. Consider a balanced diet and regular exercise to lose weight.</div>";
    } else {
        recommendationText += "<div class='recommendation obesity'>You are obese. It's important to consult a healthcare professional for personalized advice.</div>";
    }

    if (gender === "male" && bfp > 25) {
        recommendationText += "<div class='recommendation underweight'>Your body fat percentage is higher than normal for men. Consider focusing on fat loss exercises and a balanced diet.</div>";
    } else if (gender === "female" && bfp > 32) {
        recommendationText += "<div class='recommendation underweight'>Your body fat percentage is higher than normal for women. Consider focusing on fat loss exercises and a balanced diet.</div>";
    }

    return recommendationText;
}
