# 08. MW Prediction

> **Version:** CE Express v7.2

1. Objective
This tutorial will show you how to add new MW links, manage and do predictions.
At the end of the exercise you will be able to:
- Create and import MW equipment.
- Create MW links in the project.
- Do MW Predictions.
2. Initial data
Prepared project with:
- [Network objects](#kw:object-types:ce-express-network-objects).
- Geodata.
- Equipment and [models](#kw:31-models:ce-express-tr-models).
3. Add Links
The link objects can be imported or created manually using Add functionality. Open Add
Object tool and select Link option from drop-down menu list.

---

Click once on T1 site and second time to D1 site.
It will fill general parameters automatically.
Height, azimuth and other parameters are calculated automatically, leave them as it is.
Press Show Profile button to preview topographical data between Site A and Site B, if there
is LOS, what [Fresnel zone](#kw:fresnel-zone-clearance:ce-express-profile) percentage value, etc.
Profile will be generated.

---

Close Profile windows.
Define parameters are defined below:
- Name: MW001
- Radio Model: 2. Aurora 2400
- Frequency Plan: 10GHz-CEPT12-05-3_5MHz-350MHz
- Carriers: 1 and 3 (1’ and 3’ will be automatically assigned).
- Go to Antenna section and change antenna to Antenna 10MHz

---

Press Save Changes button.
Do not close the dialog, create new links and define parameters:
- Between D1 and E2
o Name: MW002
o SiteA: Lower
o Radio Model: 2. Aurora 2400
o Frequency Plan: 10GHz-CEPT12-05-3_5MHz-350MHz

---

o Carriers: 2 and 4
o Antenna for Site A and Site B: Antenna 10MHz
Press Save Changes
- Between E6 and M77
o Name: MW003
o SiteA: Lower
o Radio Model: 2. Aurora 2400
o Frequency Plan: 10GHz-CEPT12-05-3_5MHz-350MHz
o Carriers: 1 and 4

---

o Antenna for Site A and Site B: Antenna 10MHz
Press Save Changes
4. RL Predictions
The predictions are working between selected links and provides all necessary information
about power budget, interference or availability.
Select all links on the map and open Link Prediction tool. Before launching the predictions,
enable Calculate Interference option.

---

Press Run button and wait will prediction are completed and results loaded into your project.
The primary results are Power Budget and Profile between Tx and Rx. On the left, select
another link and results will be updated accordingly.

---

Selected Link can have several carriers, to preview the results expand Carrier option.
Click on Interference tab to display interfering links and interfered links information.
Total Interference is shown in Power Budget section.
Interference link predictions can be previewed too. Click on Interfering Link in top left corner
and it will display selected interfering link Power Budget, Path Loss and draw a line on the
map.

---

Go back to Links section, select MW001 from T1 to D1, Carrier 1’H.
Click on Interference tab, and analize Inteference From table. Link MW002, from Site: E2
with Carrier 2’H interferes:
- Interference, dBm: -100.248 dBm
- FML, dB: 1.29E-10
Close Link [Prediction results](#kw:viewing-results:ce-express-rf-prediction), select MW002 link on the map and open [Object Editor](#kw:73-object-editor:ce-pro-emf).
Double click on the link.

---

Find Frequency Plan table, select Upper and change carrier 2’ polarization to Vertical.
Save Changes.
Select all links on the map, open Link Prediction tool again and run predictions.
After predictions are done, open MW001 (A-B) interference predictions and preview how
Interference From is changed for MW002 link, Site E2.
Close Link [Prediction Results](#kw:viewing-results:ce-express-rf-prediction) dialog.

## 4.1 Geoclimatic data

Geoclimatic data, comprising factors such as rain rate, temperature, gaseous absorption,
and multipath fading, significantly shapes the planning and efficacy of microwave links.
Rain rate introduces the challenge of rain fade, where increased rainfall leads to greater
signal attenuation. To address this, microwave link planners employ rain attenuation
[models](#kw:31-models:ce-express-tr-models), adjusting transmitter power or incorporating diversity techniques to maintain link
reliability. Temperature variations impact atmospheric conditions, influencing signal
propagation. Planners consider these effects to optimize link performance and account for
temperature-related changes in their designs. Gaseous absorption, particularly by
atmospheric water vapor and oxygen, is factored into link planning by selecting frequency
bands less susceptible to absorption, particularly for long-distance links. Lastly, the impact
of multipath fading is mitigated through strategies like antenna diversity and adaptive
modulation, as well as terrain-aware antenna placement. By navigating these geoclimatic
challenges, microwave link planners ensure robust and effective communication links in
diverse environmental conditions.
The tool is located in CE RLP tab, Radio Links section.

---

Run Link Predictions again. After successful calculations, leave MW001 (A-B) link selected,
and click on Performance tab.
Review Multipath ITU and Rain ITU percentage values.
Close results, and open Geoclimatic Data tool.
Click on Multipath Fading tab, and define:
- ITU-R P.530 version: 17

---

Click on Rain Fading tab, and define:
Press Save Changes. Close Geoclimatic Data tab, and run Link Predictions again. Review
Performance tab calculations for MW001 (A-B) link. [Compare](#kw:98-compare-predictions:ce-pro-rcp) them with previous results.

---
