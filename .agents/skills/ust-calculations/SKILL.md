---
name: ust-calculations
description: Reference guide and verification formulas for Underground Storage Tank (UST) excavation, drop tube sizing, deadman buoyancy, backfill, and concrete yardage calculations.
---

# UST Engineering Calculations Reference

Use this skill whenever verifying, implementing, or troubleshooting mathematical formulas and calculations in the UST Field Hub application.

---

## 1. Excavation & Soil Calculations

### Pit Volume (Prismoidal / Trapezoidal Sump)
For sloped walls per OSHA 1926 Subpart P:
$$\text{Top Length} = \text{Bottom Length} + 2 \times (\text{Depth} \times \text{Slope Ratio})$$
$$\text{Top Width} = \text{Bottom Width} + 2 \times (\text{Depth} \times \text{Slope Ratio})$$
$$\text{Volume (cu ft)} = \frac{\text{Depth}}{6} \times \left(A_{\text{bottom}} + A_{\text{top}} + 4 \times A_{\text{mid}}\right)$$
$$\text{Volume (cu yds)} = \frac{\text{Volume (cu ft)}}{27}$$

### Pipe Trench Fall Rate
$$\text{Total Fall (inches)} = \text{Trench Length (feet)} \times \text{Pitch Rate (inches/ft)}$$
- Standard pitch rates: $1/8"$ ($0.125"$) per foot or $1/4"$ ($0.25"$) per foot.

---

## 2. Drop Tube Sizing Formula

Drop tubes deliver fuel directly to the tank bottom while maintaining vapor recovery seal requirements:

$$\text{Cut Length} = (\text{Tank Diameter} + \text{Riser Pipe Height}) - \text{Bottom Clearance}$$

* **Standard Bottom Clearance:** $6\text{ inches}$ (PEI RP100 / EPA 40 CFR compliance).
* **Riser Height:** Measured from top of tank shell to top of the drop tube collar / spill container bottom.

---

## 3. Hold-Down & Buoyancy Calculations (PEI RP100)

Under high water table conditions, empty tanks will float unless held down by anchors and overburden.

### Buoyancy Upward Force ($F_B$)
$$F_B = \text{Tank Capacity (gallons)} \times 8.34\text{ lbs/gal}$$
*(Or displaced submerged volume in cubic feet $\times 62.4\text{ lbs/cf}$)*

### Downward Restraining Forces ($F_D$)
$$F_D = W_{\text{tank}} + W_{\text{deadmen (submerged)}} + W_{\text{overburden (submerged)}}$$

* **Submerged Concrete Deadmen Weight:**
  $$\text{Submerged Weight} = \text{Volume (cu ft)} \times (150 - 62.4) = \text{Volume (cu ft)} \times 87.6\text{ lbs/cf}$$
* **Safety Factor ($SF$):**
  $$SF = \frac{F_D}{F_B}$$
  **Target Threshold:** $SF \ge 1.20$ (PEI RP100 minimum standard).

---

## 4. Backfill & Aggregate Material Displacement

### Net Pea Gravel / Crushed Stone Volume
$$\text{Gross Pit Volume} - \sum \text{Tank Volumes} - \sum \text{Deadman Volumes} = \text{Net Backfill (cu yds)}$$
$$\text{Tonnage} = \text{Net Volume (cu yds)} \times \text{Material Density Factor (typically } 1.3\text{–}1.45\text{ tons/yd}^3\text{)}$$
$$\text{Order Volume} = \text{Net Volume} \times (1 + \text{Waste Factor})$$
*(Standard waste factor is $5\%\text{ to }10\%$)*

---

## 5. Concrete Sizing & Yardage

### Slab / Deadman Anchor Volume
$$\text{Volume (cu yds)} = \frac{\text{Length (ft)} \times \text{Width (ft)} \times \text{Thickness (ft)}}{27} \times \text{Quantity}$$
*(Add standard $5\text{–}10\%$ delivery buffer)*
