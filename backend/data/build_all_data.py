import json
import os

# 1. Authoritative Bungalows
bungalows = [
  {
    "id": "bungalow_yamuna",
    "modelName": "Yamuna",
    "fullName": "Yamuna 5 BHK Standard Plan",
    "propertyType": "Bungalow",
    "bhk": 5,
    "plotSize": "40' × 40'",
    "plotArea": "1600 sqft",
    "plotAreaSqft": 1600,
    "builtUpArea": "2200 sqft",
    "builtUpAreaSqft": 2200,
    "carpetArea": "1680 sqft",
    "carpetAreaSqft": 1680,
    "configuration": "5 BHK | G+1 Standard Plan",
    "floors": "Ground Floor + First Floor",
    "meaning": "Spacious Multi-Generational Family Home",
    "roomSpecifications": [
      { "floor": "Ground Floor", "space": "Parking Area", "dimensions": "12'-4\" × 15'-0\"", "remarks": "Covered Vehicle Parking" },
      { "floor": "Ground Floor", "space": "Bedroom 1", "dimensions": "10'-6\" × 14'-0\"", "remarks": "Ground Floor Bedroom 1" },
      { "floor": "Ground Floor", "space": "Bedroom 2", "dimensions": "10'-6\" × 14'-0\"", "remarks": "Ground Floor Bedroom 2" },
      { "floor": "Ground Floor", "space": "Toilet 1", "dimensions": "7'-0\" × 6'-0\"", "remarks": "Ground Floor Bathroom 1" },
      { "floor": "Ground Floor", "space": "Toilet 2", "dimensions": "7'-0\" × 6'-0\"", "remarks": "Ground Floor Bathroom 2" },
      { "floor": "Ground Floor", "space": "Puja Room", "dimensions": "7'-0\" × 4'-3\"", "remarks": "Dedicated Sacred Puja Space" },
      { "floor": "Ground Floor", "space": "Kitchen", "dimensions": "7'-0\" × 8'-4\"", "remarks": "Ground Floor Kitchen" },
      { "floor": "Ground Floor", "space": "Drawing Cum Dining", "dimensions": "19'-4\" × 20'-3\"", "remarks": "Large Family Living & Dining Hall" },
      { "floor": "First Floor", "space": "Bedroom 1", "dimensions": "10'-6\" × 14'-0\"", "remarks": "First Floor Bedroom 1" },
      { "floor": "First Floor", "space": "Bedroom 2", "dimensions": "10'-6\" × 14'-0\"", "remarks": "First Floor Bedroom 2" },
      { "floor": "First Floor", "space": "Bedroom 3", "dimensions": "10'-0\" × 13'-0\"", "remarks": "First Floor Bedroom 3" },
      { "floor": "First Floor", "space": "Toilet 1", "dimensions": "7'-0\" × 6'-1\"", "remarks": "First Floor Bathroom 1" },
      { "floor": "First Floor", "space": "Toilet 2", "dimensions": "7'-0\" × 6'-6\"", "remarks": "First Floor Bathroom 2" },
      { "floor": "First Floor", "space": "Drawing Cum Dining", "dimensions": "19'-4\" × 20'-3\"", "remarks": "Upper Family Living & Lounge Hall" },
      { "floor": "First Floor", "space": "Balcony", "dimensions": "12'-4\" × 7'-2\"", "remarks": "Main Balcony" },
      { "floor": "First Floor", "space": "Wide Balcony 1", "dimensions": "7' × 3.5'", "remarks": "Side Balcony 1" },
      { "floor": "First Floor", "space": "Wide Balcony 2", "dimensions": "7' × 3.5'", "remarks": "Side Balcony 2" }
    ],
    "setbacks": { "rear": "4'", "sideLeft": "3'", "sideRight": "2'", "front": "5'" },
    "amenities": ["Covered Parking Area", "Dual Living & Dining Halls", "Dedicated Puja Room", "3 Balconies", "5 Bedrooms & 4 Bathrooms"]
  },
  {
    "id": "bungalow_business",
    "modelName": "Business",
    "fullName": "Business 2 BHK Bungalow",
    "propertyType": "Bungalow",
    "bhk": 2,
    "plotSize": "25' × 40'",
    "plotArea": "1000 sqft",
    "plotAreaSqft": 1000,
    "builtUpArea": "1500 sqft",
    "builtUpAreaSqft": 1500,
    "carpetArea": "600 sqft",
    "carpetAreaSqft": 600,
    "configuration": "2 BHK | Ground Floor Multipurpose Commercial Hall + First Floor Residential + Terrace",
    "floors": "Ground Floor + First Floor + Terrace Floor",
    "meaning": "Dual Commercial & Residential Living",
    "roomSpecifications": [
      { "floor": "Ground Floor", "space": "Front Setback", "dimensions": "6'1\"", "remarks": "Front Open Buffer" },
      { "floor": "Ground Floor", "space": "Side Setback", "dimensions": "2'6\"", "remarks": "Side Passage" },
      { "floor": "Ground Floor", "space": "Rear Setback", "dimensions": "4'", "remarks": "Rear Setback" },
      { "floor": "Ground Floor", "space": "Multipurpose Hall", "dimensions": "20'0\" × 32'0\"", "remarks": "Large Commercial / Office / Clinic Space" },
      { "floor": "First Floor", "space": "Bedroom 1", "dimensions": "10'0\" × 11'0\"", "remarks": "Residential Bedroom 1" },
      { "floor": "First Floor", "space": "Bedroom 2", "dimensions": "10'0\" × 11'0\"", "remarks": "Residential Bedroom 2" },
      { "floor": "First Floor", "space": "Open Kitchen + Drawing / Dining", "dimensions": "9'7\" × 28'7\"", "remarks": "Spacious Combined Living & Kitchen" },
      { "floor": "First Floor", "space": "Toilet 1", "dimensions": "6'1\" × 6'2\"", "remarks": "First Floor Bathroom 1" },
      { "floor": "First Floor", "space": "Toilet 2", "dimensions": "6'1\" × 6'2\"", "remarks": "First Floor Bathroom 2" },
      { "floor": "First Floor", "space": "Front Balcony", "dimensions": "14'1\" × 3'2\"", "remarks": "Front Facing Balcony" },
      { "floor": "First Floor", "space": "Back Balcony", "dimensions": "6'0\" × 3'0\"", "remarks": "Rear Balcony" },
      { "floor": "Terrace Floor", "space": "Gazebo Seating", "dimensions": "13'0\" × 12'0\"", "remarks": "Rooftop Gazebo Seating Area" },
      { "floor": "Terrace Floor", "space": "Mumty Area", "dimensions": "Standard", "remarks": "Staircase Mumty Access" },
      { "floor": "Terrace Floor", "space": "Terrace Area", "dimensions": "Open Roof", "remarks": "Rooftop Open Terrace" }
    ],
    "setbacks": { "front": "6'1\"", "side": "2'6\"", "rear": "4'" },
    "amenities": ["Ground Floor Multipurpose Business Hall (20x32 ft)", "Rooftop Gazebo (13x12 ft)", "Dual Balconies", "Open Kitchen & Dining"]
  },
  {
    "id": "bungalow_ananta",
    "modelName": "Ananta",
    "fullName": "Ananta 3 BHK Bungalow",
    "propertyType": "Bungalow",
    "bhk": 3,
    "plotSize": "Bihar: 24 × 45 = 1080 sq.ft | Jharkhand: 24 × 46 = 1104 sq.ft",
    "plotArea": "1080 sqft (Bihar) / 1104 sqft (Jharkhand)",
    "plotAreaSqft": 1080,
    "builtUpArea": "1800 sq.ft",
    "builtUpAreaSqft": 1800,
    "carpetArea": "1335 sq.ft",
    "carpetAreaSqft": 1335,
    "configuration": "3 BHK | G+1 + Rooftop Amenities",
    "floors": "Ground Floor + First Floor + Rooftop Amenities",
    "meaning": "ANANTA = INFINITE (अनंत) | Infinite Home (अनंत घर) | Infinite Dream (अनंत सपने)",
    "roomSpecifications": [
      { "floor": "Ground Floor", "space": "Parking Space", "dimensions": "11.6 × 16.6 sq.ft", "remarks": "Seatout Area + Shoe Rack" },
      { "floor": "Ground Floor", "space": "Living Area", "dimensions": "17 × 12 sq.ft", "remarks": "Simple False Ceiling + Chandelier" },
      { "floor": "Ground Floor", "space": "Semi Open Kitchen", "dimensions": "6 × 11 sq.ft", "remarks": "Breakfast Table + Garden Area" },
      { "floor": "Ground Floor", "space": "1 Room", "dimensions": "13 × 11 sq.ft", "remarks": "Office / Study / Guest Room (According to Customer); Sofa Cum Bed + Meeting Table" },
      { "floor": "Ground Floor", "space": "1 Toilet", "dimensions": "4.8 × 11 sq.ft", "remarks": "Ground Floor Bathroom" },
      { "floor": "First Floor", "space": "Master Bedroom Suite", "dimensions": "Room: 13 × 11; Bathroom: 4.8 × 11", "remarks": "2 Rooms + 2 Bathrooms / Master Bedroom" },
      { "floor": "First Floor", "space": "Family Lounge Area", "dimensions": "17 × 12 sq.ft", "remarks": "Upper Family Lounge" },
      { "floor": "First Floor", "space": "Front Balcony", "dimensions": "13.5 × 3 sq.ft", "remarks": "Front Balcony" },
      { "floor": "First Floor", "space": "Back Balcony", "dimensions": "10 × 2.6 sq.ft", "remarks": "Rear Balcony" },
      { "floor": "Rooftop Amenities", "space": "Open Terrace with Roofing Glass", "dimensions": "12.7 × 12 sq.ft", "remarks": "Designer Glass Roof Terrace" },
      { "floor": "Rooftop Amenities", "space": "Open Puja Space", "dimensions": "4 × 4 sq.ft", "remarks": "Rooftop Sacred Puja Space" },
      { "floor": "Rooftop Amenities", "space": "Gym + Yoga Space", "dimensions": "11.7 × 11 sq.ft", "remarks": "Fitness & Yoga Deck" },
      { "floor": "Rooftop Amenities", "space": "Store Room", "dimensions": "6 × 11 sq.ft", "remarks": "Utility Store Room" },
      { "floor": "Rooftop Amenities", "space": "Pergola Area", "dimensions": "17 × 12 sq.ft", "remarks": "Architectural Pergola Zone" }
    ],
    "setbacks": { "rear": "4'", "sideLeft": "3'", "sideRight": "2'", "front": "5'" },
    "amenities": ["Open Terrace with Roofing Glass (12.7x12 ft)", "Rooftop Gym + Yoga Space (11.7x11 ft)", "Pergola Area (17x12 ft)", "Open Puja Space (4x4 ft)", "Store Room (6x11 ft)", "Parking Space with Seatout & Shoe Rack", "Semi Open Kitchen with Breakfast Table & Garden Area"]
  },
  {
    "id": "bungalow_jayanti",
    "modelName": "Jayanti",
    "fullName": "Jayanti 3 BHK Standard Bungalow",
    "propertyType": "Bungalow",
    "bhk": 3,
    "plotSize": "21'-5\" × 42'-0\"",
    "plotArea": "900 sqft",
    "plotAreaSqft": 900,
    "builtUpArea": "1300 sqft",
    "builtUpAreaSqft": 1300,
    "carpetArea": "940 sqft",
    "carpetAreaSqft": 940,
    "configuration": "3 BHK Standard Efficient Bungalow",
    "floors": "Ground Floor + First Floor",
    "meaning": "Smart & Efficient Compact Bungalow Living",
    "roomSpecifications": [
      { "floor": "Ground Floor", "space": "Parking Area", "dimensions": "8'-8\" × 13'-0\"", "remarks": "Covered Vehicle Porch" },
      { "floor": "Ground Floor", "space": "Drawing and Dining", "dimensions": "10'-6\" × 20'-0\"", "remarks": "Ground Living-Dining Hall" },
      { "floor": "Ground Floor", "space": "Kitchen", "dimensions": "6'-10\" × 10'-0\"", "remarks": "Ground Floor Kitchen" },
      { "floor": "Ground Floor", "space": "Bedroom", "dimensions": "10'-0\" × 10'-0\"", "remarks": "Ground Floor Bedroom" },
      { "floor": "Ground Floor", "space": "Toilet", "dimensions": "6'-4\" × 5'-0\"", "remarks": "Ground Floor Bathroom" },
      { "floor": "First Floor", "space": "Portico / Balcony", "dimensions": "8'-8\" × 12'-6\"", "remarks": "Upper Front Portico / Balcony" },
      { "floor": "First Floor", "space": "Bedroom 1", "dimensions": "10'-6\" × 14'-0\"", "remarks": "First Floor Master Bedroom" },
      { "floor": "First Floor", "space": "Bedroom 2", "dimensions": "17'-3\" × 10'-0\"", "remarks": "Spacious Second Bedroom" },
      { "floor": "First Floor", "space": "Toilet", "dimensions": "6'-10\" × 14'-0\"", "remarks": "Large Upper Bathroom" }
    ],
    "setbacks": { "rear": "3'", "sideLeft": "2'", "sideRight": "2'", "front": "4'" },
    "amenities": ["Covered Parking Porch", "First Floor Portico / Balcony", "Spacious 17x10 ft Bedroom", "Large 6.8x14 ft Bathroom"]
  },
  {
    "id": "bungalow_ceo",
    "modelName": "CEO",
    "fullName": "CEO 5 BHK Bungalow – Super Luxury Dream Home",
    "propertyType": "Bungalow",
    "bhk": 5,
    "plotSize": "40' × 40' = 1600 sq.ft.",
    "plotArea": "1600 sqft",
    "plotAreaSqft": 1600,
    "builtUpArea": "2500 sq.ft.",
    "builtUpAreaSqft": 2500,
    "carpetArea": "1810 sq.ft.",
    "carpetAreaSqft": 1810,
    "configuration": "5 BHK | G+1 with Rooftop Amenities (By Deepak Kumar)",
    "floors": "Ground Floor + First Floor + Rooftop Amenities",
    "meaning": "Super Luxury Flagship Executive Residence",
    "roomSpecifications": [
      { "floor": "Ground Floor", "space": "Parking Space", "dimensions": "12'-6\" × 15'-0\"", "remarks": "Executive Car Parking" },
      { "floor": "Ground Floor", "space": "Drawing / Dining Room", "dimensions": "19'-4\" × 20'-3\"", "remarks": "False Ceiling + Italian Tiles" },
      { "floor": "Ground Floor", "space": "Modular Kitchen", "dimensions": "11'-0\" × 13'-0\"", "remarks": "With Dishwasher + Breakfast Table" },
      { "floor": "Ground Floor", "space": "Master Bedroom", "dimensions": "10'-6\" × 14'-0\"", "remarks": "Attached Toilet – 10'-6\" × 5'-6\", Italian Tiles" },
      { "floor": "Ground Floor", "space": "Common Bedroom", "dimensions": "10'-6\" × 14'-0\"", "remarks": "Ground Floor Bedroom" },
      { "floor": "Ground Floor", "space": "Common Toilet", "dimensions": "7'-0\" × 6'-5\"", "remarks": "Ground Floor Bathroom" },
      { "floor": "Ground Floor", "space": "Lawn Area – 2 Nos.", "dimensions": "12'-9\" × 7'-10\"", "remarks": "Twin Landscaped Lawns" },
      { "floor": "First Floor", "space": "Master Bedroom", "dimensions": "10'-6\" × 14'-0\"", "remarks": "Attached Toilet – 10'-6\" × 5'-6\" + Balcony – 7'-0\" × 4'-0\"" },
      { "floor": "First Floor", "space": "Common Bedroom 1", "dimensions": "10'-6\" × 14'-0\"", "remarks": "First Floor Bedroom 1" },
      { "floor": "First Floor", "space": "Common Bedroom 2", "dimensions": "10'-6\" × 14'-0\"", "remarks": "1 Room Attached Balcony – 7'-0\" × 4'-0\"" },
      { "floor": "First Floor", "space": "Common Balcony", "dimensions": "12'-4\" × 5'-6\"", "remarks": "Attached Hall" },
      { "floor": "First Floor", "space": "Common Toilet", "dimensions": "7'-0\" × 6'-5\"", "remarks": "First Floor Bathroom" },
      { "floor": "First Floor", "space": "Living Area", "dimensions": "12'-6\" × 17'-0\"", "remarks": "Upper Living Lounge" },
      { "floor": "Rooftop Amenities", "space": "Gym + Yoga Space", "dimensions": "10'-6\" × 13'-0\"", "remarks": "Rooftop Wellness Deck" },
      { "floor": "Rooftop Amenities", "space": "Gym Room", "dimensions": "Standard", "remarks": "Running Treadmill & Muscular Cycle" },
      { "floor": "Rooftop Amenities", "space": "Swimming Pool", "dimensions": "13'-0\" × 6'-5\"", "remarks": "Private Pool With Active Filtration System" },
      { "floor": "Rooftop Amenities", "space": "Shower Area", "dimensions": "8'-0\" × 4'-0\"", "remarks": "Dedicated Pool Shower" },
      { "floor": "Rooftop Amenities", "space": "Gazebo", "dimensions": "13'-0\" × 10'-6\"", "remarks": "Seating Area with Furniture" },
      { "floor": "Rooftop Amenities", "space": "Slant Deck", "dimensions": "8'-0\" × 9'-0\"", "remarks": "Beach Style Tiles" }
    ],
    "setbacks": { "rear": "4'", "sideLeft": "3'", "sideRight": "3'", "front": "5'" },
    "amenities": ["Private Rooftop Swimming Pool with Filtration (13x6.5 ft)", "Rooftop Gym Room with Treadmill & Muscular Cycle", "Furnished Rooftop Gazebo (13x10.5 ft)", "Beach Style Slant Deck (8x9 ft)", "Rooftop Shower Area (8x4 ft)", "Twin Ground Floor Lawns (12.75x7.8 ft each)", "Italian Tiles & False Ceiling", "Modular Kitchen with Dishwasher & Breakfast Table"]
  },
  {
    "id": "bungalow_godawari",
    "modelName": "Godawari",
    "fullName": "Godawari 3 BHK Bungalow",
    "propertyType": "Bungalow",
    "bhk": 3,
    "plotSize": "(23'-10\" × 42') = 1000 sqft.",
    "plotArea": "1000 sqft",
    "plotAreaSqft": 1000,
    "builtUpArea": "900 sqft",
    "builtUpAreaSqft": 900,
    "carpetArea": "710 sqft",
    "carpetAreaSqft": 710,
    "configuration": "3 BHK | Ground Floor + Terrace Floor",
    "floors": "Ground Floor + Terrace Floor Plan",
    "meaning": "Serene Riverfront-Inspired Living",
    "roomSpecifications": [
      { "floor": "Ground Floor Plan", "space": "Bedroom 1", "dimensions": "9'7\" × 12'0\"", "remarks": "Ground Bedroom 1" },
      { "floor": "Ground Floor Plan", "space": "Bedroom 2", "dimensions": "9'7\" × 12'0\"", "remarks": "Ground Bedroom 2" },
      { "floor": "Ground Floor Plan", "space": "Toilet 1", "dimensions": "4'7\" × 5'9\"", "remarks": "Bathroom 1" },
      { "floor": "Ground Floor Plan", "space": "Toilet 2", "dimensions": "4'7\" × 5'9\"", "remarks": "Bathroom 2" },
      { "floor": "Ground Floor Plan", "space": "Open Kitchen + Drawing / Dining Hall", "dimensions": "10'-0\" × 20'3\"", "remarks": "Integrated Living, Dining & Open Kitchen" },
      { "floor": "Terrace Floor Plan", "space": "Auxiliary Room", "dimensions": "10'0\"8 × 8'5\"", "remarks": "Terrace Auxiliary Room" },
      { "floor": "Terrace Floor Plan", "space": "Puja Room", "dimensions": "3'-10\" × 6'11\"", "remarks": "Dedicated Terrace Puja Room" },
      { "floor": "Terrace Floor Plan", "space": "Cut Out", "dimensions": "6\" × 18\"", "remarks": "Ventilation Cut Out" },
      { "floor": "Terrace Floor Plan", "space": "Height Parapet Wall", "dimensions": "3'0\"", "remarks": "Terrace Parapet Safety Wall" }
    ],
    "setbacks": { "rear": "3'", "sideLeft": "2'", "sideRight": "2'", "front": "4'" },
    "amenities": ["Terrace Auxiliary Room (10x8.5 ft)", "Dedicated Terrace Puja Room (3.8x6.9 ft)", "Combined Open Kitchen & Living Hall (10x20.25 ft)", "3 ft Safety Parapet Terrace Wall"]
  },
  {
    "id": "bungalow_kaveri",
    "modelName": "Kaveri",
    "fullName": "Kaveri 4 BHK Bungalow",
    "propertyType": "Bungalow",
    "bhk": 4,
    "plotSize": "25' × 40' = 1000 sq.ft.",
    "plotArea": "1000 sqft",
    "plotAreaSqft": 1000,
    "builtUpArea": "1400 sqft",
    "builtUpAreaSqft": 1400,
    "carpetArea": "1060 sqft",
    "carpetAreaSqft": 1060,
    "configuration": "4 BHK | Ground Floor + First Floor",
    "floors": "Ground Floor + First Floor",
    "meaning": "Graceful 4 BHK Family Residence",
    "roomSpecifications": [
      { "floor": "Ground Floor", "space": "Parking Area", "dimensions": "11'6\" × 13'0\"", "remarks": "Spacious Vehicle Parking" },
      { "floor": "Ground Floor", "space": "Drawing and Dining Room", "dimensions": "10'5\" × 12'6\"", "remarks": "Ground Living & Dining Hall" },
      { "floor": "Ground Floor", "space": "Kitchen", "dimensions": "6'0\" × 8'0\"", "remarks": "Ground Floor Kitchen" },
      { "floor": "Ground Floor", "space": "Bedroom 1", "dimensions": "10'0\" × 13'0\"", "remarks": "Ground Floor Bedroom 1" },
      { "floor": "Ground Floor", "space": "Bedroom 2", "dimensions": "10'0\" × 13'5\"", "remarks": "Ground Floor Bedroom 2" },
      { "floor": "Ground Floor", "space": "Toilet", "dimensions": "4'0\" × 8'0\"", "remarks": "Ground Floor Bathroom" },
      { "floor": "First Floor", "space": "Open Terrace", "dimensions": "11'6\" × 13'0\"", "remarks": "Upper Open Terrace" },
      { "floor": "First Floor", "space": "Drawing and Dining Room", "dimensions": "10'5\" × 12'6\"", "remarks": "First Floor Family Living" },
      { "floor": "First Floor", "space": "Kitchen", "dimensions": "6'0\" × 8'0\"", "remarks": "First Floor Second Kitchen" },
      { "floor": "First Floor", "space": "Toilet", "dimensions": "4'0\" × 8'0\"", "remarks": "First Floor Bathroom" },
      { "floor": "First Floor", "space": "Bedroom 1", "dimensions": "10'0\" × 13'5\"", "remarks": "First Floor Bedroom 1" },
      { "floor": "First Floor", "space": "Bedroom 2", "dimensions": "10'0\" × 13'0\"", "remarks": "First Floor Bedroom 2" }
    ],
    "setbacks": { "rear": "3'", "sideLeft": "2'", "sideRight": "2'", "front": "4'" },
    "amenities": ["11.5x13 ft Ground Parking Area", "11.5x13 ft First Floor Open Terrace", "Dual Kitchens (Ground + First Floor)", "Dual Drawing/Dining Halls"]
  }
]

# 2. Authoritative Flats
flats = [
  {
    "id": "flat_nano",
    "modelName": "Nano",
    "fullName": "1 BHK Flat (Nano)",
    "propertyType": "Flat",
    "bhk": 1,
    "superBuiltUpArea": "500 sqft.",
    "superBuiltUpAreaSqft": 500,
    "builtUpArea": "350 sqft.",
    "builtUpAreaSqft": 350,
    "carpetArea": "325 sqft.",
    "carpetAreaSqft": 325,
    "configuration": "1 BHK Flat",
    "roomSpecifications": [
      { "space": "Drawing and Dining With Open kitchen", "dimensions": "15'11\" × 10'0\"", "remarks": "Kitchen Slab: 6'6\" × 1'6\"" },
      { "space": "Bedroom", "dimensions": "11'06\" × 10'0\"", "remarks": "Well-proportioned Bedroom" },
      { "space": "Toilet", "dimensions": "4'00\" × 6'6\"", "remarks": "Bathroom" },
      { "space": "Balcony", "dimensions": "4'5\" × 3'6\"", "remarks": "Private Balcony" }
    ],
    "parking": [
      { "vehicleType": "Bike", "dimensions": "5'0\" × 8'0\"", "areaSqft": 40 },
      { "vehicleType": "Car", "dimensions": "8'6\" × 14'6\"", "areaSqft": 126 }
    ]
  },
  {
    "id": "flat_ganga",
    "modelName": "Ganga",
    "fullName": "2 BHK Flat (Ganga)",
    "propertyType": "Flat",
    "bhk": 2,
    "superBuiltUpArea": "700 sqft.",
    "superBuiltUpAreaSqft": 700,
    "builtUpArea": "510 sqft.",
    "builtUpAreaSqft": 510,
    "carpetArea": "450 sqft.",
    "carpetAreaSqft": 450,
    "configuration": "2 BHK Flat",
    "roomSpecifications": [
      { "space": "Drawing and Dining", "dimensions": "13'09\" × 10'0\"", "remarks": "Family Living and Dining Area" },
      { "space": "Open kitchen", "dimensions": "6'09\" × 5'0\"", "remarks": "Functional Open Kitchen" },
      { "space": "Bedroom 1", "dimensions": "10'00\" × 11'0\"", "remarks": "Primary Bedroom" },
      { "space": "Bedroom 2", "dimensions": "10'00\" × 11'0\"", "remarks": "Second Bedroom" },
      { "space": "Toilet", "dimensions": "6'4\" × 4'7\"", "remarks": "Full Bathroom" },
      { "space": "Balcony", "dimensions": "8'3\" × 3'0\"", "remarks": "Spacious Front Balcony" }
    ],
    "parking": [
      { "vehicleType": "Bike", "dimensions": "5'0\" × 8'0\"", "areaSqft": 40 },
      { "vehicleType": "Car", "dimensions": "8'6\" × 14'6\"", "areaSqft": 126 }
    ]
  },
  {
    "id": "flat_adity",
    "modelName": "Adity",
    "fullName": "3 BHK Flat (Adity)",
    "propertyType": "Flat",
    "bhk": 3,
    "superBuiltUpArea": "1100 sqft.",
    "superBuiltUpAreaSqft": 1100,
    "builtUpArea": "750 sqft.",
    "builtUpAreaSqft": 750,
    "carpetArea": "670 sqft.",
    "carpetAreaSqft": 670,
    "configuration": "3 BHK Flat",
    "roomSpecifications": [
      { "space": "Drawing and Dining", "dimensions": "14'07\" × 8'11\"", "remarks": "Main Living and Dining Hall" },
      { "space": "Kitchen", "dimensions": "5'3\" × 7'3\"", "remarks": "Dedicated Kitchen" },
      { "space": "1. Master Bedroom + Toilet", "dimensions": "Master Bed: 10'02\" × 12'8\" | Toilet: 4'-6\" × 10'-1\"", "remarks": "Attached Master Bathroom Suite" },
      { "space": "2. Bedroom", "dimensions": "10'06\" × 8'10\"", "remarks": "Second Bedroom" },
      { "space": "3. Bedroom", "dimensions": "14'07\" × 8'10\"", "remarks": "Third Bedroom" },
      { "space": "Common Toilet", "dimensions": "5'3\" × 10'1\"", "remarks": "Common Family Bathroom" },
      { "space": "Wide Balcony", "dimensions": "10'2\" × 3'6\"", "remarks": "Wide Outdoor Balcony" }
    ],
    "parking": [
      { "vehicleType": "Bike", "dimensions": "5'0\" × 8'0\"", "areaSqft": 40 },
      { "vehicleType": "Car", "dimensions": "8'6\" × 14'6\"", "areaSqft": 126 }
    ]
  }
]

# 3. Authoritative Building Specifications & Amenities
building_specs = {
  "specifications": [
    { "particular": "Structure", "deluxe": "R.C.C Frame", "luxury": "R.C.C Frame", "category": "Structure & Walls" },
    { "particular": "Wall", "deluxe": "5\" Brick Work", "luxury": "5\" Brick Work", "category": "Structure & Walls" },
    { "particular": "Flooring", "deluxe": "24\"x24\" Tiles", "luxury": "24\"x48\" Tiles", "category": "Flooring & Finishes" },
    { "particular": "Wall Interior", "deluxe": "Wall Putty ( In House)", "luxury": "Wall Putty With Primer ( No Paint)", "category": "Painting & Finishes" },
    { "particular": "Wall Exterior", "deluxe": "Wall Texture Front Only", "luxury": "Wall Texture All Side Outer Wall", "category": "Painting & Finishes" },
    { "particular": "Bathroom Tiles", "deluxe": "Tiles upto 5'", "luxury": "Tiles upto 7'", "category": "Tiles & Bathroom" },
    { "particular": "Kitchen Wall Tiles", "deluxe": "2' Height from Slab Hight", "luxury": "7' Height - From Slab Hight", "category": "Tiles & Bathroom" },
    { "particular": "Kitchen Top", "deluxe": "Black Granite with Half Mould", "luxury": "Black & Red Mix Granite with Full Molding", "category": "Kitchen & Fixtures" },
    { "particular": "CP Fitting", "deluxe": "Normal ( Non Branded)", "luxury": "Hindware", "category": "Sanitary & Plumbing" },
    { "particular": "Hall Basin", "deluxe": "Basin Only ( Non Branded)", "luxury": "Pedstal Basin (Hindware)", "category": "Sanitary & Plumbing" },
    { "particular": "Door Frame", "deluxe": "Red Stone Frame", "luxury": "Granite Stone Frame", "category": "Doors & Windows" },
    { "particular": "Door Sutter", "deluxe": "Flush Door", "luxury": "Flush Door with Laminate", "category": "Doors & Windows" },
    { "particular": "Windows", "deluxe": "Aluminum", "luxury": "UPVC (2-Track)", "category": "Doors & Windows" },
    { "particular": "Stair Railing", "deluxe": "S.S Railing (202)", "luxury": "S.S Railing (304)", "category": "Staircase" },
    { "particular": "Stair Top", "deluxe": "Granite with Tiles", "luxury": "Granite with Full Molding", "category": "Staircase" },
    { "particular": "No. of AC Point", "deluxe": "1-Bedroom", "luxury": "All Bedroom", "category": "Electrical" },
    { "particular": "Electric Fitting", "deluxe": "Modular (Great-White)", "luxury": "Modular Gray (Great-White)", "category": "Electrical" },
    { "particular": "Inverter Point", "deluxe": "NA", "luxury": "Yes", "category": "Electrical" },
    { "particular": "Roof Top", "deluxe": "NA", "luxury": "Heavy Duty Tile (1'x1')", "category": "Roofing & Exterior" },
    { "particular": "Parking Area", "deluxe": "I.P.S ((Cemented Plaster)", "luxury": "Parking Tiles (1'X1')", "category": "Roofing & Exterior" }
  ],
  "structuralData": [
    { "sl": 1, "item": "Plinth", "type": "Standard Size", "value": "0’8” × 0’10”" },
    { "sl": 2, "item": "Slab", "type": "Standard Size", "value": "100 MM (4\")" },
    { "sl": 3, "item": "Beam", "type": "Standard Size", "value": "0’8” × 0’12”" },
    { "sl": 4, "item": "Column", "type": "Standard Size", "value": "0’8” × 0’10”" },
    { "sl": 5, "item": "Pile Cap", "type": "Standard Size", "value": "3’00” × 3’00”" },
    { "sl": 6, "item": "Foundation", "type": "Foundation Type", "value": "Pile Foundation / Isolated Footing" },
    { "sl": 7, "item": "IPS", "type": "Finishing Type", "value": "Cemented Plaster" },
    { "sl": 8, "item": "Master Plan / Floor Plan – Render", "type": "Project Status", "value": "Running Project" }
  ],
  "ironRodDetails": [
    { "work": "Column", "rodSize": "12 mm", "quantity": "4 PC" },
    { "work": "Beam / Plinth", "rodSize": "12 mm", "quantity": "4 PC" },
    { "work": "Footing", "rodSize": "10 mm", "quantity": "Standard" },
    { "work": "Chhat / Roof Slab", "rodSize": "8 mm", "quantity": "Standard" }
  ],
  "materials": [
    { "material": "Bricks", "detail": "Red Bricks" },
    { "material": "Cement", "detail": "Dalmiya / JK SUPER" },
    { "material": "Iron Rod", "detail": "Rungta and Hindustan" }
  ],
  "projectAmenities": [
    { "sl": 1, "amenityHindi": "मंदिर", "amenityEnglish": "Temple" },
    { "sl": 2, "amenityHindi": "Swimming Pool", "amenityEnglish": "Swimming Pool" },
    { "sl": 3, "amenityHindi": "Garden", "amenityEnglish": "Garden" },
    { "sl": 4, "amenityHindi": "Open Gym", "amenityEnglish": "Open Gym" },
    { "sl": 5, "amenityHindi": "Boundary Wall", "amenityEnglish": "Boundary Wall" },
    { "sl": 6, "amenityHindi": "20 फीट Internal Road", "amenityEnglish": "20 Feet Internal Road" },
    { "sl": 7, "amenityHindi": "24×7 Security Guard", "amenityEnglish": "24×7 Security Guard" },
    { "sl": 8, "amenityHindi": "24×7 Water Supply", "amenityEnglish": "24×7 Water Supply" },
    { "sl": 9, "amenityHindi": "Dedicated Transformer / बिजली की सुविधा", "amenityEnglish": "Dedicated Transformer / Electricity Facility" }
  ]
}

# 4. Save files
with open("backend/data/bungalows.json", "w", encoding="utf-8") as f:
    json.dump(bungalows, f, indent=2, ensure_ascii=False)
with open("backend/data/flats.json", "w", encoding="utf-8") as f:
    json.dump(flats, f, indent=2, ensure_ascii=False)
with open("backend/data/buildingSpecifications.json", "w", encoding="utf-8") as f:
    json.dump(building_specs, f, indent=2, ensure_ascii=False)

print("Saved bungalows, flats, and building specifications successfully!")
