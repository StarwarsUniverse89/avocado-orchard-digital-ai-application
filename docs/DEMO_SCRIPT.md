# Gemini Orchard Operations Agent — Demo Script

**System:** Avocado Orchard Digital AI Application  
**Branch:** google-rapid-agent  
**Audience:** Hackathon judges, investors, agriculture operators  

---

## The Pitch (30 seconds)

This is not a chatbot. It is a **Gemini-powered operations agent** that uses tools, memory, visualization, and human oversight to help agricultural teams get more done. The operator stays in control. The agent does the heavy lifting.

---

## One Operator Journey

Follow this story in the Command Center. Every step is a button in the **Gemini Orchard Operations Agent** panel (right column, top).

---

### Step 1 — I enter the Command Center

**What the operator sees:**
- Globe view of the Michoacán avocado belt
- Live metric cards (yield, moisture, temperature, revenue)
- Gemini Orchard Operations Agent workflow panel on the right

**What to say:**
> "This is the Command Center. The Gemini agent is ready. Let me scan the full belt."

---

### Step 2 — I scan the avocado belt

**Action:** Click **"Scan Avocado Belt"**

**What the agent returns:**
- Municipalities scanned: 12
- Orchard clusters detected: 847
- Hectares monitored: 142,500
- High-risk areas: 3
- Recommended next region: Tancítaro

**What to say:**
> "The agent scanned the entire belt and recommended Tancítaro as the highest-priority region. Agent used operational memory — this context feeds every following step."

---

### Step 3 — The agent segments orchard blocks

**Action:** Click **"Segment Orchards"**

**What the agent returns:**
- 5 detected orchard blocks
- Estimated hectares per block
- Canopy density classification
- Stress level per block (high / medium / low)
- Blocks saved to MongoDB mission memory

**What to say:**
> "The agent segmented individual orchard blocks using spatial canopy density analysis. Now I pick the one I want to act on."

---

### Step 4 — I select a block for deeper analysis

**Action:** Click a block from the list (pick the one marked **high stress**)

**What the system stores:**
- `selected_orchard_block` (block_id, hectares, tree count, stress level)

**What to say:**
> "I selected the high-stress block. The agent now has context for everything downstream — reconstruction, drone mission, analysis."

---

### Step 5 — The agent reconstructs an operational twin

**Action:** Click **"Reconstruct Twin"**

**What the agent returns (Operational Twin Calibration):**
- Canopy height
- Canopy volume index
- Tree spacing
- Terrain variation
- Reconstruction confidence
- 14-day re-capture recommendation

**What to say:**
> "The agent reconstructed a digital twin from canopy imagery. Confidence is above 85%. This twin drives the drone mission planner."

---

### Step 6 — The agent dispatches a drone mission

**Action:** Click **"Dispatch Drone Inspection"**

**What the agent returns:**
- Mission ID
- Waypoint count
- Priority inspection zones
- Route drawn on Cesium globe

**What to say:**
> "The agent generated a mission plan automatically. You can see the route on the globe. Priority zones are flagged — those are where the stress signatures are strongest."

---

### Step 7 — The agent analyzes inspection results

**Action:** Click **"Analyze Inspection"**

**What the agent returns:**
- Detected issues (water stress, nutrient deficiency, etc.)
- Severity level
- Confidence score
- Yield risk percentage
- Estimated financial exposure

**What to say:**
> "The agent analyzed the mock imagery and detected water stress and nutrient issues at medium severity. 18% yield risk. $145,000 financial exposure. Now let's see if the intervention makes financial sense."

---

### Step 8 — The agent estimates ROI and delay risk

**Action:** Click **"Simulate Intervention ROI"**

**What the agent returns:**
- Estimated intervention cost
- Avoided loss estimate
- Yield recovery percentage
- 14-day delay risk (additional exposure %)

**What to say:**
> "The agent ran the intervention model. Treating now costs $12,000 and recovers $145,000 in avoided losses. Waiting 14 days increases exposure by 12%. The math is clear."

---

### Step 9 — The agent drafts a field task

**Action:** Click **"Draft Field Task"**

**What the agent returns:**
- Task title and priority
- Draft message for the field agronomist
- Delivery channel placeholders (SMS, Email, WhatsApp)
- `approval_required: true`
- No message sent

**What to say:**
> "The agent drafted the field task with the full context — severity, financial impact, recommended treatment. It's ready to send. But it doesn't send anything. I'm in control."

---

### Step 10 — I approve or hold the task

**Action:** Click **"Approve & Hold for Dispatch"** or **"Hold Task"**

**What the system does:**
- Records operator decision
- No message dispatched
- Workflow marked complete

**What to say:**
> "I approve the task. It's held for authorized dispatch. The agent logged everything to MongoDB mission memory — the next operator who opens this orchard sees the full history. That's human-in-the-loop operations."

---

## Core Message

**This is a Gemini-powered operations agent that:**
- Uses tools (drone planning, spatial segmentation, ROI modeling)
- Maintains memory (MongoDB-backed mission history)
- Visualizes everything (Cesium globe, drone routes, orchard blocks)
- Requires human approval before any action reaches the field

**Not a chatbot. An operations system.**

---

## Technical Stack (for judges)

| Layer | Technology |
|-------|------------|
| Agent reasoning | Gemini 2.0 Flash (Vertex AI) |
| Backend | FastAPI (Python) |
| Memory | MongoDB Atlas + local fallback |
| 3D Globe | Cesium / Resium |
| 3D Twin | React Three Fiber + Three.js |
| Frontend | Next.js 15 + Tailwind |
| Infrastructure | Google Cloud (Vertex AI, Cloud Run ready) |

---

## Demo Tips

- Keep globe in **Globe View** during steps 1–6 to show drone route rendering
- Switch to **3D Twin** view after step 5 to show the reconstructed orchard
- If backend is offline, mock fallback data ensures all 9 steps still complete
- "Local fallback memory active" badge is shown transparently — this is by design

---

## Failure Recovery

If any step returns an error, the button resets to **idle** so the operator can retry. The workflow never locks permanently. Mock fallback data kicks in for step 1 (Scan) if the backend is unreachable.
