# CE Pro — Prediction Models


5. Prediction models

Path Loss

𝐹𝑖𝑒𝑙𝑑 𝑆𝑡𝑟𝑒𝑛𝑔ℎ𝑡 = 𝐸𝐼𝑅𝑃 − 𝐴𝑛𝑡𝑒𝑛𝑛𝑎𝐴𝑡𝑡𝑒𝑛𝑢𝑎𝑡𝑖𝑜𝑛 -
PathLoss

2

Prediction Models

•
ITU-R P.452 (6GHz to 50GHz)
• UniMacro (400MHz to 3GHz)
• CEC ITU-R (100MHz to 6GHz)
• LOS ITU-R P.525 (6GHz to 100 GHz)
•
ITU-R P.368 (10kHz to 30MHz)

3

CE Path Loss models (10kHz - 100 GHz)

1. CEC ITU-R Model (100MHz – 6GHz) is a combination model intended for use in a variety of different radiocommunication systems which is derived explicitly

from ITU-R path loss modelling methods as follows:

a. Receive antenna in LOS condition – path loss calculated as FSL based on Recommendation ITU-R P.525 (ref URL);
b. Receive antenna in OLOS condition – total path loss modelled as a combination of basic FSL calculated based on Recommendation ITU-R P.525 (ref

URL) and clutter loss calculated based on Recommendation ITU-R P.2108 (ref URL);

c. Receive antenna in NLOS condition – path loss as a combination of basic FSL calculated based on Recommendation ITU-R P.525 (ref URL), additional
losses due to diffraction calculated based on Recommendation ITU-R P.526 (ref URL) and the clutter losses calculated based on Rec. ITU-R P.2108
(ref URL).

2.

ITU-R P.452 Model (6GHz – 50GHz) is provided as a universally applicable model with very wide frequency range from 0.1-50 GHz. Its implementation is
based on the methodology described in the Recommendation ITU-R P.452 (ref URL). This model does not provide for definition of OLOS visibility condition;
instead it considers clutter as part of general obstacles category and accordingly distinguishes only two radio visibility cases:

a. Receive antenna in LOS condition – path loss modelled based on FSL principle;
b. Receive antenna in NLOS condition – total path loss modelled using a combination of basic transmission losses and losses due to diffraction.

3.

LOS ITU-R P.525 Model (6GHz – 100GHz) is the FSL path loss calculated based on method in Recommendation ITU-R P.525 (ref URL). As such it could be
used for modelling of radio links where LOS is considered a necessary condition, e.g., for Fixed (Point-to-Point) Links or Mobile Systems in mmWave bands.

4. UniMacro Model (400MHz – 3GHz) is the CE’s proprietary combination model developed over the years of practical experience with the operational planning
of cellular mobile networks in the frequency ranges from 400-2600 MHz. It had been fine tuned to produce coverage predictions that are most closely aligned
with what could be expected to be experienced by the actual mobile network users in the field. The model will model different path losses depending on radio
visibility conditions as follows:

a. Receive antenna in LOS condition – path loss modelled based on FSL principle;
b. Receive antenna in OLOS condition – path loss modelled using Extended Hata (Open Area) model with additional clutter loss calculated based on

Recommendation ITU-R P.2108 (ref URL);

c. Receive antenna in NLOS condition – path loss modelled using Extended Hata model with additional losses due to diffraction calculated based on

Recommendation ITU-R P.526 (ref URL) as well as clutter losses based on Rec. ITU-R P.2108 (ref URL).

5.

ITU-R P.368 (10kHz – 30MHz)

4

Prediction Models. Default

5

CEC ITU-R (30MHz – 6GHz)

• For frequencies from about 30 MHz 

to about 6 GHz.

• Modelling:
•
LOS
• OLOS
• NLOS

Clutter losses

UE

Diffraction

Free Space Loss

Hclutter

Diffraction

Hobstacles

DSM

DTM

6

Input Data

• Elevation

• Clutter classes*

• Clutter height grid*

• Receiver settings

• Prediction model settings

Geographic data

Network data

Algorithm

* Optional

7

Path loss equation

Path loss in dB:

Offset coefficient (KOff ) - Constant offset (dBm). Default value 32
Distance coefficient (KLogD ) - Distance influence coefficient. Default value 20
Frequency coefficient (KLogF ) - Frequency influence coefficient. Default value 20

8

)log()log(loglogfkdkkLFDoff++=Path loss equation

Path loss in dB:

Offset coefficient (KOff ) - Constant offset (dBm). Default value 32
Distance coefficient obstructed (KLogD ) - Distance influence coefficient. Default value 30
Frequency coefficient (KLogF ) - Frequency influence coefficient. Default value 20

9

)log()log(loglogfkdkkLFDoff++=Clutter

• Diffraction loss for solid obstacle:

• Building clutter class
•

Elevation

• Clutter loss

• Based on diffraction calculation
• P.2108 Clutter Loss

• Penetration loss (Outdoor – Indoor)

• Receiver loss

10

SKE Diffraction

Rec. ITU-R P.526
Idealized model of diffraction over a single obstruction.

  

d 1



1

h >  0

d 2 



2  

11

Clutter LOS

P.2108 Clutter Loss Estimation 

• Method 1: Additional clutter shadowing 
loss with diffraction as dominant effect 
(section 3.1)

12

Penetration loss (Outdoor – Indoor)

CE Outdoor to Indoor Path Loss calculation is realised based on method 
recommended in 3GPP TR 38.901 (ref URL). This method accounts for 
indoor portion of the total radio signal propagation path as shown in picture:

Definition of indoor propagation path in 3GPP TR 38.901

For general purpose modelling of typical building entry losses, two types of loss profiles are assumed:
• Low-loss BEL Model assumes a wall penetration losses characteristic of average traditional 

buildings;

• High-loss BEL Model assumes a wall penetration losses characteristic of modern thermally 

insulated buildings.

The corresponding BEL and building penetration losses are calculated as follows:

Where:

f – frequency in GHz.

13

fL2.02glass+=fL3.023IIRglass+=fL45concrete+=Prediction model manager

• Cellular Expert tab > Prediction Model 

Manager

• Default can not be deleted and it takes 
parameters from it for new models

14

LOS ITU-R P.542 (6GHz – 50GHz)

• For frequencies from about 6 GHz to about 100 GHz

Clutter losses

UE

Diffraction

Free Space Loss

Hclutter

Diffraction

Hobstacles

DSM

DTM

15

Input Data

• Elevation

• Clutter classes*

• Clutter height grid*

• Receiver settings

• Prediction model settings

Geographic data

Network data

Algorithm

* Optional

16

Path loss equation

Path loss in dB:

Offset coefficient (KOff ) - Constant offset (dBm). Default value 32
Distance coefficient (KLogD ) - Distance influence coefficient. Default value 20
Frequency coefficient (KLogF ) - Frequency influence coefficient. Default value 20

17

)log()log(loglogfkdkkLFDoff++=Clutter

• Diffraction loss 

• Building clutter class
• Elevation

• Penetration loss (Outdoor – Indoor)

18

Single Knife Edge Diffraction

Rec. ITU-R P.526
Idealized model of diffraction over a single obstruction.

  

d 1



1

h >  0

d 2 



2  

19

Penetration loss (Outdoor – Indoor)

CE Outdoor to Indoor Path Loss calculation is realised based on method 
recommended in 3GPP TR 38.901 (ref URL). This method accounts for 
indoor portion of the total radio signal propagation path as shown in picture:

Definition of indoor propagation path in 3GPP TR 38.901

For general purpose modelling of typical building entry losses, two types of loss profiles are assumed:
• Low-loss BEL Model assumes a wall penetration losses characteristic of average traditional 

buildings;

• High-loss BEL Model assumes a wall penetration losses characteristic of modern thermally 

insulated buildings.

The corresponding BEL and building penetration losses are calculated as follows:

Where:

f – frequency in GHz.

20

fL2.02glass+=fL3.023IIRglass+=fL45concrete+=LOS ITU-R P.525 (6GHz – 100GHz)

• For frequencies from about 6 GHz to about 100 GHz

Clutter losses

UE

Diffraction

Free Space Loss

Hclutter

Diffraction

Hobstacles

DSM

DTM

21

Input Data

• Elevation

• Clutter classes*

• Clutter height grid*

• Receiver settings

• Prediction model settings

Geographic data

Network data

Algorithm

* Optional

22

Path loss equation

Path loss in dB:

Offset coefficient (KOff ) - Constant offset (dBm). Default value 32
Distance coefficient (KLogD ) - Distance influence coefficient. Default value 20
Frequency coefficient (KLogF ) - Frequency influence coefficient. Default value 20

23

)log()log(loglogfkdkkLFDoff++=UniMacro

• Frequency: ~ 100 MHz - 2 GHz (3 GHz)
• Distance: up to 100 km
• 9999 Model (Ericsson)

Clutter losses

UE

Diffraction

Free Space Loss

Hclutter

Diffraction

Hobstacles

DSM

DTM

24

Input Data

• Elevation

• Clutter classes*

• Clutter height grid*

• Receiver settings

• Prediction model settings

Geographic data

Network data

Algorithm

* Optional

25

Equation

• Line-Of-Sight Model Loss

• 9999 Ericsson

• Single Knife Edge Diffraction

26

Path Loss Equation: 9999 Ericsson

Path loss in dB:

Parameter

Description

a0

a1

a2

a3

Constant offset in dB. This value is simply added to loss grid. By adjusting 
this value, the mean error can be minimized. It regulates the absolute level of 
the loss curve.

Distance influence coefficient. Physically it represents loss dependant on 
distance such as atmospheric (dust, hydrometeors, etc...) losses. It regulates 
slope of the curve.

Transmitter height influence coefficient. It is related to errors in DTM, real 
Earth curvature, etc. It regulates loss curve vertical position like the a0, but 
with respect to antenna height

Okumura-Hata type of multiplying factor for log(hB)log(d)

Default 
Value

36.8

30.2

-12.0

0.1

27

()())(75.11log2.3)log()log()log()log(23210fghdhahadaaLMBBH+++++=2))(log(78.4)log(49.44)(fffg+=9999 Ericsson: A0

•
•

•

9999 Model is very convenient for calibration

Empirical parameters a0-a3 can be deduced from the measured path 
loss dependence on distance – drive-tests

a0 is a constant offset of path loss curve

28

90110130150170190110100Distance, kmPath Loss, dBmA0 = 26.2A0 = 36.2A0 = 46.29999 Ericsson: A1

•
•

9999 Model is very convenient for calibration

a1 regulates slope of the path loss curve

29

90110130150170190210110100Distance, kmPath Loss, dBmA1 = 20.7A1 = 30.7A1 = 40.79999 Ericsson: A2

•
•

9999 Model is very convenient for calibration

a2 regulates loss curve vertical position like a0, but with respect to 
antenna height

30

90100110120130140150160170180110100Distance, kmPath Loss, dBmA2 = -12 h=20mA2 = -14 h=20mA2 = -12 h=50mA2 = -12 h=80mA2 = -14 h=80m9999 Ericsson: A3

•
•

9999 Model is very convenient for calibration

a3 defines slope of the path loss curve for different base station 
antenna heights

31

100110120130140150160170180110100Distance, kmPath Loss, dBmA3 = -0.5A3 = 0.1A3 = 0.6Path loss equation

Path loss in dB:

KOff - Constant offset (dBm). Default value 32  (!)
KLogD - Distance influence coefficient. Default value 20
KLogF - Frequency influence coefficient. Default value 20

32

)log()log(loglogfkdkkLFDoff++=Clutter

• Diffraction loss for solid obstacle:

• Building clutter class
•

Elevation

• Clutter loss

• Based on diffraction calculation
• P.2108 Clutter Loss

• Penetration loss (Outdoor – Indoor)

• Receiver loss

33

SKE Diffraction

Rec. ITU-R P.526
Idealized model of diffraction over a single obstruction.

  

d 1



1

h >  0

d 2 



2  

34

Clutter LOS

P.2108 Clutter Loss Estimation 

• Method 1: Additional clutter shadowing 
loss with diffraction as dominant effect 
(section 3.1)

35

Penetration loss (Outdoor – Indoor)

CE Outdoor to Indoor Path Loss calculation is realised based on method 
recommended in 3GPP TR 38.901 (ref URL). This method accounts for 
indoor portion of the total radio signal propagation path as shown in picture:

Definition of indoor propagation path in 3GPP TR 38.901

For general purpose modelling of typical building entry losses, two types of loss profiles are assumed:
• Low-loss BEL Model assumes a wall penetration losses characteristic of average traditional 

buildings;

• High-loss BEL Model assumes a wall penetration losses characteristic of modern thermally 

insulated buildings.

The corresponding BEL and building penetration losses are calculated as follows:

Where:

f – frequency in GHz.

36

fL2.02glass+=fL3.023IIRglass+=fL45concrete+=Exercise

Description: C:\CE_Course\0. Descriptions

Name: 5. Prediction models.pdf

37

Thank you! 

Tel.: +370 5 2150575

Email: info@cellular-expert.com

S.Konarskio g. 28A LT-03127 Vilnius 
Lithuania