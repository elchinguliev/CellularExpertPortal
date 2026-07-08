# CE Pro — Cell Prediction


4. Cell prediction

Cell structure

• Physical parameters

• Coordinates
• Height
• Azimuth
• …

• Logical parameters

• Power
• Bandwidth
• Frequency
• …

2

Cell: Coordinates

• Projected coordinate system:

• X
• Y

• Geographic coordinate system in meters:

•
•

Longitude
Latitude

• Z – total cell height above sea level.

3

Cell Name

• Unique parameter in the project.
• Best server – the same.

4

General cells parameter

Value

CE Field

Units

Example

Description

latitude

Meters

49.9993

Y point coordinate in Decimal degrees and in WGS 1984 geographical coordinate system.

longitude

Meters

33.6573

X point coordinate in Decimal degrees and in WGS 1984 geographical coordinate system.

Latitude

Longitude

Cell identification

Site identification

Cell height
Cell azimuth

Mechanical tilt
Frequency
Power

cell_name

site_name

height
azimuth

tilt
frequency
power

Antenna Gain

Antenna_gain

Misc. Loss

Bandwidth

Misc_loss

bandwidth

[text]

[text]

meters
degree

degree
MHz
dBm

dBi

dB

5G cell XXYY

Represents cell identification, usually name.

Site 55 ID

Represents site identification, usually name.

40
50

1
3500
40

18.2

1

Cell height above the ground.
Cell direction from the north, value ranges from 0 to 360.

Cell mechanical tilt value.
Frequency value in MHz.
Based on Workspace parameter, it can be only Cell power, and EIRP will be calculated from
antenna gain and misc loss. It can represent EIRP value too, if Workspace parameter Calculate
EIRP is defined to No.
Gain of antenna which is assigned for Cell.

Total Cell loss.

MHz

0.015

Cell bandwidth value in MHz. Especially required for 3G, 4G, and 5G technologies.

Subcarrier spacing

Subcarrier_spacing

kHz

15

Especially required for 5G, as 4G uses constant value 15.

MIMO configuration

MIMO configuration

Cell load

tx_mimo

rx_mimo

cell_load

Number 4

Number 4

Percent 30

Transmitter MIMO configuration, possible values 1, 2, 4, 8, 16, 32, 64.

Receiver MIMO configuration, possible values 1, 2, 4, 8, 16, 32, 64.

Parameter ranges are from 0 to 100 percent. Describes how the cell is loaded in real-time. Load is
taken for broadband calculations.

Technology

technology

Text

2G

Possible values: 2G, 3G, 4G, 5G. Describes cell technology.

Antenna name

antenna_id

Number 1

Represents Antenna ID value.

5

RF Predictions structure

• Predictions
• Results
• Temp

6

Exercise

Description: C:\CE_Course\0. Descriptions

Name: 4. Cell Prediction.pdf

7

Thank you! 

Tel.: +370 5 2150575

Email: info@cellular-expert.com

S.Konarskio g. 28A LT-03127 Vilnius 
Lithuania