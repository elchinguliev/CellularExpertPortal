# CE Pro — Creating Objects


3. Creating objects

Create object

Import from text (done in previous exercise)

•
• Create manually using Add Object tool:

• Cell;
• Site;
• Repeater;
• CPE;
• Etc..

• Duplicate existing object or objects in the project
• Move existing object or objects in the project

2

Steps to create cell

• Define location

• Type specific coordinates in:

Projected coordinate system – X and Y coordinates;

•
• Geographical coordinate system – Latitude and Longitude 

coordinates

• Click on the map: coordinates will be filled 

automatically from point defined on the map.

• Define direction (azimuth) – this will be 

required if Cell object coordinates will be taken 
by click on the map.

• Define name
• Choose Template or fill parameters manually

3

Template

• Automatically fills the attributes
• Template Manager
• Own table

4

Create Cell

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

5

Object Editor

• Open Object Editor
• Select features
• Double click on object
• Apply – to save changes
• Prediction model
• Antenna

6

Move / Duplicate

• Object Editor
• Select objects
• Move / Duplicate
• Select point / Define coordinates
• Save

7

Exercise

Description: C:\CE_Course\0. Descriptions

Name: 3. Creating Objects.pdf

8

Thank you! 

Tel.: +370 5 2150575

Email: info@cellular-expert.com

S.Konarskio g. 28A LT-03127 Vilnius 
Lithuania