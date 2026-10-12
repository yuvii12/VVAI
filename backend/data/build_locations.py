import json
import re

state_map = {
    # Bihar
    "ARA": "Bihar",
    "AURANGABAD": "Bihar",
    "BEGUSARAI": "Bihar",
    "BETTIAH": "Bihar",
    "BHAGALPUR": "Bihar",
    "BIHAR SHARIF": "Bihar",
    "BIHAR SARIF": "Bihar",
    "BUXAR": "Bihar",
    "DARBHANGA": "Bihar",
    "DEHRI-ON-SONE": "Bihar",
    "DEHRI ON SONE": "Bihar",
    "GAYA": "Bihar",
    "HAJIPUR": "Bihar",
    "JEHANABAD": "Bihar",
    "JAHANABAD": "Bihar",
    "KATIHAR": "Bihar",
    "MADHUBANI": "Bihar",
    "MOTIHARI": "Bihar",
    "MUNGER": "Bihar",
    "MUZAFFARPUR": "Bihar",
    "PATNA": "Bihar",
    "PURNEA": "Bihar",
    "PURNIA": "Bihar",
    "SAHARSA": "Bihar",
    "SAMASTIPUR": "Bihar",
    "SASARAM": "Bihar",
    "SITAMARHI": "Bihar",
    "SIWAN": "Bihar",
    "CHHAPRA": "Bihar",
    # Jharkhand
    "BOKARO": "Jharkhand",
    "DEOGHAR": "Jharkhand",
    "DHANBAD": "Jharkhand",
    "GIRIDIH": "Jharkhand",
    "HAZARIBAGH": "Jharkhand",
    "JAMSHEDPUR": "Jharkhand",
    "RANCHI": "Jharkhand",
    # West Bengal
    "ALIPURDUAR": "West Bengal",
    "ASANSOL": "West Bengal",
    "DURGAPUR": "West Bengal",
    "KOLKATA": "West Bengal",
    "SILIGURI": "West Bengal",
    # Uttar Pradesh
    "GORAKHPUR": "Uttar Pradesh",
    "MIRZAPUR": "Uttar Pradesh",
    "VARANASI": "Uttar Pradesh",
    "VARANASHI": "Uttar Pradesh",
    # Odisha
    "BHUBANESHWAR": "Odisha",
    "BHUBNESHWAR": "Odisha",
    "ROURKELA": "Odisha"
}

with open("backend/data/location_pdf_fulltext.txt", "r", encoding="utf-8") as f:
    raw_lines = f.readlines()

records = []
current_state = "Bihar"
city_offices = {}

header_regex = re.compile(r"Office \+ Site Address - (Bihar|Jharkhand|West Bengal|Uttar Pradesh|Odisha)", re.I)

for raw in raw_lines:
    line = raw.strip()
    if not line:
        continue
    
    # Check state header
    m_st = header_regex.search(line)
    if m_st:
        st_found = m_st.group(1).title()
        if "West" in st_found:
            st_found = "West Bengal"
        elif "Uttar" in st_found:
            st_found = "Uttar Pradesh"
        current_state = st_found
        continue
    
    if "(05/09/2026)" in line or "Complete and" in line or line == "Running" or line == "City" or "Update Location" in line:
        continue

    # 1. Check for OFFICE
    if " - OFFICE" in line.upper() or " - Office" in line or line.endswith("- OFFICE") or "- OFFICE" in line:
        parts = re.split(r" - OFFICE\s*| - Office\s*|- OFFICE\s*", line, flags=re.I)
        city_raw = parts[0].strip()
        rest = parts[1].strip() if len(parts) > 1 else ""
        
        city_clean = city_raw.title()
        if "Bihar" in city_clean:
            city_clean = "Bihar Sharif"
        elif "Dehri" in city_clean:
            city_clean = "Dehri-On-Sone"
        elif "Bhub" in city_clean:
            city_clean = "Bhubaneswar"
        elif "Varan" in city_clean:
            city_clean = "Varanasi"
        elif "Jehan" in city_clean:
            city_clean = "Jehanabad"

        state = state_map.get(city_raw.upper(), current_state)
        address = rest
        if rest.lower().startswith("running "):
            address = rest[8:].strip()

        city_offices[city_clean.lower()] = {
            "city": city_clean,
            "state": state,
            "officeAddress": address or f"Vastu Vihar Branch Office, {city_clean}",
            "raw": line
        }
        continue

    # 2. Check for PHASE / PROJECT / SITE
    # Split by known status markers
    # Markers: Running, runing, complete, Completed, not active yet, sold out, shop/ 2 unit, not found
    status_marker_regex = re.compile(r"\b(Running|runing|complete|Completed|not active yet|sold out|shop/\s*2\s*unit|not found)\b", re.I)
    
    match_status = status_marker_regex.search(line)
    
    if match_status:
        before_status = line[:match_status.start()].strip()
        status_word = match_status.group(1).strip()
        after_status = line[match_status.end():].strip()
        
        # Parse before_status: [CITY] (PHASE|PH|PROJECT)? -? [PHASE_NUM]
        # e.g. "GAYA PH - 02", "PATNA PHASE - 07", "BHAGALPUR - 01", "SASARAM PROJECT 5"
        m_head = re.match(r"^([A-Z\s-]+?)(?:\s+(PHASE|PH|PROJECT))?\s*-\s*([0-9A-Z&, -]+)$", before_status, re.I)
        if not m_head:
            m_head = re.match(r"^([A-Z\s-]+?)\s+(PROJECT|PHASE|PH)\s+([0-9A-Z&, -]+)$", before_status, re.I)
            
        if m_head:
            city_raw = m_head.group(1).strip()
            phase_num = m_head.group(3).strip()
            phase_str = f"Phase-{phase_num}" if "PROJECT" not in before_status.upper() else f"Project-{phase_num}"
        else:
            # Simple fallback
            tokens = before_status.split()
            city_raw = tokens[0] if tokens else "Unknown"
            phase_str = " ".join(tokens[1:]) if len(tokens) > 1 else "Phase-01"
            
        city_clean = city_raw.title()
        if "Bihar" in city_clean:
            city_clean = "Bihar Sharif"
        elif "Dehri" in city_clean:
            city_clean = "Dehri-On-Sone"
        elif "Bhub" in city_clean:
            city_clean = "Bhubaneswar"
        elif "Varan" in city_clean:
            city_clean = "Varanasi"
        elif "Jehan" in city_clean:
            city_clean = "Jehanabad"

        state = state_map.get(city_raw.upper(), current_state)
        
        s_low = status_word.lower()
        if "running" in s_low or "runing" in s_low:
            norm_status = "Running"
        elif "complete" in s_low or "sold out" in s_low:
            norm_status = "Completed"
        elif "not active yet" in s_low or "not found" in s_low:
            norm_status = "Not Active Yet"
        else:
            norm_status = status_word.title()

        addr_clean = after_status
        if not addr_clean and norm_status == "Completed":
            addr_clean = f"Vastu Vihar {city_clean} {phase_str} Site (Completed & Handed Over)"
        elif not addr_clean:
            addr_clean = f"Vastu Vihar {city_clean} {phase_str} Site"

        # Extract landmarks and distances
        nearby = ""
        road_dist = ""
        station_dist = ""
        famous_place = ""
        
        near_match = re.search(r"(?:near|beside|infront of|front of|opp|opposite to)\s+([^,]+)", addr_clean, re.I)
        if near_match:
            nearby = near_match.group(0).strip()
            famous_place = near_match.group(1).strip()
        
        road_match = re.search(r"(\d+(?:\.\d+)?\s*(?:km|mtr|meter))\s*(?:from|in)?\s*([^,]+road|highway|lane)", addr_clean, re.I)
        if road_match:
            road_dist = road_match.group(0).strip()
            
        stn_match = re.search(r"([^,]+(?:station|railway|stn)[^,]*)", addr_clean, re.I)
        if stn_match:
            station_dist = stn_match.group(1).strip()

        rec = {
            "id": f"proj_{city_clean.lower().replace(' ', '_')}_{phase_str.lower().replace(' ', '_').replace('-', '_')}",
            "projectName": f"Vastu Vihar {city_clean} ({phase_str})",
            "city": city_clean,
            "state": state,
            "phase": phase_str,
            "siteAddress": addr_clean,
            "status": norm_status,
            "rawStatus": status_word,
            "nearbyLocation": nearby,
            "mainRoadDistance": road_dist,
            "railwayStationDistance": station_dist,
            "nearbyFamousPlace": famous_place,
            "source": "Official Location Document (PDF / August 2026 Update)"
        }
        records.append(rec)
    else:
        # Check if line without status marker (e.g. "CHHAPRA PHASE - 03 MaujaBrahmpur, Near for FOR Lane, Chhapra")
        m_nostat = re.match(r"^([A-Z\s-]+?)\s+(PHASE|PH|PROJECT)\s*-?\s*([0-9A-Z&, -]+?)\s+(.+)$", line, re.I)
        if m_nostat:
            city_raw = m_nostat.group(1).strip()
            phase_num = m_nostat.group(3).strip()
            addr_clean = m_nostat.group(4).strip()
            city_clean = city_raw.title()
            if "Bihar" in city_clean:
                city_clean = "Bihar Sharif"
            elif "Dehri" in city_clean:
                city_clean = "Dehri-On-Sone"
            elif "Bhub" in city_clean:
                city_clean = "Bhubaneswar"
            elif "Varan" in city_clean:
                city_clean = "Varanasi"
            elif "Jehan" in city_clean:
                city_clean = "Jehanabad"

            state = state_map.get(city_raw.upper(), current_state)
            phase_str = f"Phase-{phase_num}"

            rec = {
                "id": f"proj_{city_clean.lower().replace(' ', '_')}_{phase_str.lower().replace(' ', '_').replace('-', '_')}",
                "projectName": f"Vastu Vihar {city_clean} ({phase_str})",
                "city": city_clean,
                "state": state,
                "phase": phase_str,
                "siteAddress": addr_clean,
                "status": "Running",
                "rawStatus": "Running",
                "nearbyLocation": "",
                "mainRoadDistance": "",
                "railwayStationDistance": "",
                "nearbyFamousPlace": "",
                "source": "Official Location Document (PDF / August 2026 Update)"
            }
            records.append(rec)

# Assign office addresses
for r in records:
    c_key = r["city"].lower()
    if c_key in city_offices:
        r["officeAddress"] = city_offices[c_key]["officeAddress"]
    else:
        r["officeAddress"] = f"Vastu Vihar Branch Office, {r['city']}"

with open("backend/data/locations.json", "w", encoding="utf-8") as f:
    json.dump({
        "totalProjects": len(records),
        "totalOffices": len(city_offices),
        "offices": list(city_offices.values()),
        "projects": records
    }, f, indent=2, ensure_ascii=False)

print(f"Re-normalized {len(records)} project/site records into locations.json!")
