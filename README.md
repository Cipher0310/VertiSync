**VertiSync: Precision Urban Agriculture System**

An AI-driven, IoT-integrated vertical farming management platform designed to optimize crop yield, automate environmental controls, and minimize resource consumption.

**Project Links**

* **Live Website:** https://verti-sync-fcrx.vercel.app/
* **Pitch Presentation:** https://youtu.be/2lUKuAblKh8?si=Csiw03QnXMFVuZcC

**Overview**

Managing a vertical farm manually is resource-intensive and prone to human error. VertiSync solves this by acting as the centralized "brain" for your urban agriculture setup. By combining real-time IoT sensor telemetry with AI predictive modeling, VertiSync automates routine tasks, flags hardware anomalies, and dynamically adjusts environmental parameters based on the specific crop you are growing.

**Key Features by Module**

**1. The Dashboard (Command & Control)**
The main hub for real-time monitoring and immediate action.

* **Active Hydration Matrix:** Live tracking of soil moisture and ambient temperature.
* **AI Predictive Irrigation:** Calculates the exact estimated time to critical soil dryness and evaluates real-time plant health against target parameters.
* **Environmental Overview:** Quick-glance gauges for Humidity, Water pH, and Light Spectrum modes.
* **Manual Overrides:** Instantly toggle Automated Irrigation, Cooling Fans, and LED Grow Lights. Includes a tactile Manual Pump Override (Hold) button to force physical hardware activation.

**2. Analytics & Predictive Yield**
Data-driven insights to prove sustainability and impact.

* **Impact KPIs:** Tracks Total Water Saved, Energy Efficiency, and Estimated Carbon Reduction compared to traditional farming.
* **Resource Consumption:** Interactive 30-day trend charts comparing water and electricity usage.
* **AI Harvest Prediction:** Analyzes the current growth cycle to output an exact estimated yield (e.g., 14.5 kg) with a dynamic AI confidence score.
* **System Anomaly Log:** A chronological audit trail of all automated system interventions (e.g., auto-dosing pH buffers or reducing LED intensity).

**3. Hardware Diagnostics**
A dedicated view for engineers to monitor the physical IoT infrastructure.

* **Edge Node Telemetry:** Live tracking of the microcontroller's CPU load, GPU/NPU activity, memory, and core temperature.
* **Sensor Array Health:** Instantly flags offline hardware or probes requiring calibration (e.g., Sticky Solenoid Valves or connection losses).
* **Network & Power:** Monitors network gateway ping (ms) and real-time power draw (Wattage) against peak capacity.
* **Live Syslog Terminal:** A scrolling command-line interface showing real-time MQTT handshakes and AI engine load logs.

**4. Plant Database (Crop Library)**
The scalability engine of VertiSync.

* **Vast Crop Library:** Select from a database of plants (Bok Choy, Thyme, Lettuce, etc.).
* **Agronomy Profiles:** Displays optimal target temperatures, pH levels, light cycles, and N-P-K nutrient ratios for the selected plant.
* **Deploy to Edge Node:** One-click deployment pushes the crop's ideal recipe directly to the IoT hardware, instantly adjusting the physical environment to match the thresholds.
* **Dynamic Lifecycle Analysis:** Calculates adjusted harvest times based on the current growth phase (e.g., Seedling) and predicts resource consumption per cycle based on your planting slot count.

**User Guide: How to Use the System**

**1. Select a Profile:** Start by using the dropdown at the top navigation bar to select your Active Profile (e.g., "Malaysian Bok Choy"). Notice how the UI updates globally to reflect this plant's specific needs.

**2. Monitor the Dashboard:** Navigate to the Dashboard to view live telemetry. Watch the "AI Predictive Irrigation Engine" dynamically monitor the evaporation rate.

**3. Test the Hardware Overrides:** On the Dashboard, click and hold the Manual Pump Override button. You will see the system state change from STANDBY to ACTIVE.

**4. Deploy a New Crop Recipe:** Navigate to the Plant Database. Select a new crop from the library. Click the Deploy Recipe to Edge Node button to simulate reconfiguring the entire vertical farm's physical parameters.

**5. Check Hardware Integrity:** Navigate to Hardware Diagnostics to view the simulated edge node terminal and ensure all sensors are reporting an "Online" status.

**6. Generate Reports:** Go to Analytics to view your 30-day savings and click Download Report (CSV) for stakeholder presentations.
