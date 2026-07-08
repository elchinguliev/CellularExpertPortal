# CE Pro — Architecture Overview


Introduction: CE Structure

CE Products and Solutions

CE Desktop

For ArcGIS Pro

CE Express
For ArcGIS Enterprise

•  Desktop, Single Use Radio Planning system

•  Web-based Radio Planning system

•  Wireless planning tools, together with 

•  Server-based, Multi User system 

ArcGIS Pro functionality

•  Includes CE Inventory3D 

•  Can be used as a client of CE Express system

•  Dashboard of Network Coverage Statistics

CE Customized solutions

ArcGIS

CE COTS

CE Pro 

3

Cellular Expert for ArcGIS Pro Architecture

Cellular Expert for ArcGIS Pro
RCP | RLP | EMF

ArcGIS Pro 3.1 and 
above

Basic or higher license

Additional extensions are not 
required

Local Database

All files are saved in local disk

4

Cellular Expert for ArcGIS Pro 
License Structure

• RCP – Radio Coverage Prediction

• RLP – Radio Link Prediction

• EMF – Electromagnetic Field

5

Geospatial Information

✓ Field measurements
✓ Network coverage
✓ Network data
✓ Demography
✓ Land cover / use
✓ Obstacles
✓ Elevation
✓ Surface

6

Project files

Project > Save Project/Save Project As

7

Cellular Expert Project Structure

• Predictions
• Results
• SystemFiles
• Temp
• VolatileResults
• VolatileTemp
• Workspace.gdb

8

Workspace database files

9

Environment

• Geographic data
• Cellular Expert Workspace
• Results

10

Cellular Expert Workspace

11

Inside Workspace

➢ Network Data
➢ Equipment Data
➢ Modelling Settings

12

Network Data Structure

Cells

Cell – logical 
information 
about sector: 
a set of channels

Site

Site – location point with 
unique identifier: 
Base station

Cells

RF prediction does not require Site 
object. Cells can be created 
without Site object.

Cell still has SiteID value, which 
can be define in the attributes.

SiteID is used for Carrier 
Aggregation.

Site and Cell is connected through 
SiteID value.

SiteID must be Integer.

Site name is defined for Site object.

13

Cell

➢ 800 MHz
➢ 1800 MHz
➢ 2100 MHz

14

Site

15

Antenna

16

CE Path Loss models (10kHz - 350 GHz)

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

ITU-R P.368 Model (10kHz – 30MHz)

17

CE prediction models

18

Other

19