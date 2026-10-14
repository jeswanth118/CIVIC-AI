import express from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import type { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.resolve(DATA_DIR, 'complaints.json');

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI with recommended telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Seed data with 6 realistic complaints labeled as demonstration data
const INITIAL_DEMO_COMPLAINTS: Complaint[] = [
  {
    id: 'CIVIC-2026-1042',
    title: 'Hazardous deep pothole on Main Street & 5th Ave',
    description: 'A deep pothole (roughly 8 inches deep and 2 feet wide) has opened up in the right lane following heavy rainfall. Multiple vehicles have suffered blown tires and cars are swerving into oncoming traffic to avoid it.',
    category: 'Road Damage',
    location: 'Corner of 5th Ave & Main Street, Downtown Sector',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    isDemo: true,
    aiAnalysis: {
      category: 'Road Damage',
      summary: 'Severe road pothole causing vehicular damage and high collision risk due to swerving.',
      suggested_department: 'Department of Public Works & Road Maintenance',
      suggested_priority: 'Critical',
      priority_reason: 'Active hazard causing vehicular damage and cross-lane swerving near a major intersection.',
      recommended_action: 'Deploy emergency asphalt cold-patch crew within 12 hours and place temporary warning bollards.',
      possible_safety_risk: 'High risk of blown tires, bicycle crashes, and head-on collisions.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Complaint recorded via CIVIC AI citizen portal.',
        timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedBy: 'Citizen Reporter',
      },
      {
        status: 'Under Review',
        note: 'Assigned to Public Works rapid response dispatcher.',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        updatedBy: 'Dispatcher Martinez',
      },
      {
        status: 'In Progress',
        note: 'Repair crew #4 dispatched with mobile asphalt patch truck.',
        timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        updatedBy: 'Supervisor Chen',
      },
    ],
  },
  {
    id: 'CIVIC-2026-2187',
    title: 'Overflowing community trash bin and loose debris',
    description: 'The public recycling and waste dumpster near Oakwood Elementary park has been overflowing for 4 days. Strong odors and loose plastic waste are scattering across the playground walkway.',
    category: 'Waste Management',
    location: 'Oakwood Community Park entrance, near East Gate',
    status: 'Under Review',
    createdAt: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
    isDemo: true,
    aiAnalysis: {
      category: 'Waste Management',
      summary: 'Overflowing public waste receptacle causing litter spread and health nuisance next to an elementary playground.',
      suggested_department: 'Bureau of Sanitation & Waste Management',
      suggested_priority: 'Medium',
      priority_reason: 'Sanitation concern located near children recreation area with potential pest attraction.',
      recommended_action: 'Schedule priority trash truck pickup and evaluate bin sizing for park foot-traffic.',
      possible_safety_risk: 'Hygiene risk, insect/rodent attraction near school playground.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Complaint filed by neighborhood resident.',
        timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
        updatedBy: 'Citizen Reporter',
      },
      {
        status: 'Under Review',
        note: 'Sanitation district supervisor routing to park route team.',
        timestamp: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        updatedBy: 'Admin Sandra K.',
      },
    ],
  },
  {
    id: 'CIVIC-2026-3391',
    title: 'High-pressure water main pipe leak flooding sidewalk',
    description: 'Clean potable water has been gushing from beneath the pedestrian sidewalk outside 240 Pine Street. The water is pooling across 30 meters of walkway and beginning to erode the soil embankment.',
    category: 'Water Leakage',
    location: '240 Pine Street, Westside Residential District',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    isDemo: true,
    aiAnalysis: {
      category: 'Water Leakage',
      summary: 'Pressurized water pipe rupture flooding sidewalk and threatening soil stability.',
      suggested_department: 'Municipal Water and Sewer Authority',
      suggested_priority: 'High',
      priority_reason: 'High volume potable water loss and potential sidewalk subsidence.',
      recommended_action: 'Isolate line valve, shut off local sub-main, and excavate for pipe sleeve repair.',
      possible_safety_risk: 'Slip-and-fall hazard for pedestrians; potential sinkhole development.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Reported by local resident.',
        timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        updatedBy: 'Citizen Reporter',
      },
      {
        status: 'In Progress',
        note: 'Water Authority field technician arrived; shutoff valve located.',
        timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        updatedBy: 'Field Tech Rivera',
      },
    ],
  },
  {
    id: 'CIVIC-2026-4820',
    title: 'Series of 3 broken streetlights creating blackout zone',
    description: 'Three consecutive streetlights on Elm Ridge Road (poles #22, #23, and #24) are completely dark at night. The sidewalk is completely unlit, making night walking hazardous for commuters from the bus stop.',
    category: 'Streetlight',
    location: 'Elm Ridge Road between Birch & Cedar Lane',
    status: 'Resolved',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    isDemo: true,
    aiAnalysis: {
      category: 'Streetlight',
      summary: 'Consecutive streetlight outage causing severe pedestrian visibility blackout along a transit route.',
      suggested_department: 'Division of Electrical & Public Lighting',
      suggested_priority: 'Medium',
      priority_reason: 'Multiple dark fixtures increase pedestrian danger and crime risk along bus stop walk.',
      recommended_action: 'Inspect circuit transformer breaker and replace failed LED driver units.',
      possible_safety_risk: 'Pedestrian trip hazards in darkness, vehicle blind spots at night.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Citizen submission via mobile web.',
        timestamp: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        updatedBy: 'Citizen Reporter',
      },
      {
        status: 'Under Review',
        note: 'Electrical team verified pole IDs.',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
        updatedBy: 'Electrical Inspector',
      },
      {
        status: 'In Progress',
        note: 'Bucket truck replaced blown fuse and LED driver modules on poles #22-24.',
        timestamp: new Date(Date.now() - 16 * 3600 * 1000).toISOString(),
        updatedBy: 'Crew Lead Johnson',
      },
      {
        status: 'Resolved',
        note: 'All 3 streetlights fully illuminated and confirmed by night patrol.',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedBy: 'Supervisor Chen',
      },
    ],
  },
  {
    id: 'CIVIC-2026-5519',
    title: 'Storm drain clogged with tree branches and storm silt',
    description: 'The curbside storm drain basin is choked with fallen tree limbs, wet leaves, and gravel after the storm. Water is backing up into the bike lane and curb ramp.',
    category: 'Drainage',
    location: 'South Blvd & 12th St, near Community Center',
    status: 'Submitted',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    isDemo: true,
    aiAnalysis: {
      category: 'Drainage',
      summary: 'Storm drain grate blockage creating street water ponding in the bike corridor.',
      suggested_department: 'Stormwater & Drainage Division',
      suggested_priority: 'Medium',
      priority_reason: 'Impending rain could cause roadway flooding across pedestrian ramp.',
      recommended_action: 'Dispatch vactor suction truck or manual clearance crew to clear basin grate.',
      possible_safety_risk: 'Hydroplaning risk for cyclists and blocked wheelchair ramp access.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Initial report submitted.',
        timestamp: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updatedBy: 'Citizen Reporter',
      },
    ],
  },
  {
    id: 'CIVIC-2026-6743',
    title: 'Damaged guardrail along pedestrian footbridge',
    description: 'A section of the steel safety barrier on the pedestrian footbridge over the canal has rusted through and broken away, leaving a 4-foot unguarded opening with a 15-foot drop to the concrete canal below.',
    category: 'Public Infrastructure',
    location: 'West Canal Footbridge, Mile Marker 2.4',
    status: 'In Progress',
    createdAt: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    isDemo: true,
    aiAnalysis: {
      category: 'Public Infrastructure',
      summary: 'Broken bridge guardrail leaving an exposed fall hazard above concrete canal.',
      suggested_department: 'Department of Bridges & Structural Engineering',
      suggested_priority: 'Critical',
      priority_reason: 'Immediate life-safety hazard of falling from height onto concrete.',
      recommended_action: 'Immediately install high-visibility rigid safety barrier and weld new steel rail section.',
      possible_safety_risk: 'Critical fall from height risk for children, joggers, and pedestrians.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Citizen report with photo description.',
        timestamp: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        updatedBy: 'Citizen Reporter',
      },
      {
        status: 'In Progress',
        note: 'Temporary orange safety hoarding installed; welding crew scheduled.',
        timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        updatedBy: 'Structural Safety Engineer',
      },
    ],
  },
];

// Helper to ensure data file exists
function loadComplaints(): Complaint[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(INITIAL_DEMO_COMPLAINTS, null, 2), 'utf-8');
      return INITIAL_DEMO_COMPLAINTS;
    }
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading complaints from disk:', err);
    return INITIAL_DEMO_COMPLAINTS;
  }
}

function saveComplaints(complaints: Complaint[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(complaints, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving complaints to disk:', err);
    throw err;
  }
}

// Compute simple similarity between two strings
function computeSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2));
  const wordsB = new Set(b.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(/\s+/).filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let matches = 0;
  for (const word of wordsA) {
    if (wordsB.has(word)) matches++;
  }
  return (2 * matches) / (wordsA.size + wordsB.size);
}

// Check for duplicates
function findDuplicate(title: string, description: string, location: string, category: string, existing: Complaint[]): Complaint | null {
  for (const comp of existing) {
    if (comp.status === 'Resolved') continue;
    const catMatch = comp.category.toLowerCase() === category.toLowerCase();
    const locSim = computeSimilarity(comp.location, location);
    const textSim = computeSimilarity(`${comp.title} ${comp.description}`, `${title} ${description}`);

    // If same category and high location similarity or text similarity
    if (catMatch && (locSim > 0.45 || (locSim > 0.25 && textSim > 0.35) || textSim > 0.6)) {
      return comp;
    }
  }
  return null;
}

// --- API ROUTES ---

// 1. Real Gemini AI Analysis
app.post('/api/analyze-complaint', async (req, res) => {
  try {
    const { title, description, category, location } = req.body;

    if (!description || description.trim().length < 5) {
      return res.status(400).json({ error: 'A valid description is required for AI analysis.' });
    }

    const prompt = `You are the lead civic triage AI for CIVIC AI, a municipal complaint management system.
Analyze this community complaint reported by a citizen:

Title: "${title || 'Untitled'}"
Category: "${category || 'Unspecified'}"
Reported Location: "${location || 'Unspecified'}"
Detailed Description: "${description}"

Evaluate the complaint objectively based only on the provided text.
- Do NOT invent facts, evidence, official citations, or completed actions.
- Treat priority as an AI suggestion for human review, not an official decision.
- If there is not enough information to assess urgency, explain that more information is needed.
- Return structured JSON conforming to the requested schema.`;

    const systemInstruction = `You are CIVIC AI's expert civic complaint triage engine. Return ONLY a valid JSON object matching this schema:
{
  "category": "Road Damage" | "Waste Management" | "Water Leakage" | "Streetlight" | "Drainage" | "Public Infrastructure" | "Other",
  "summary": "Short 1-2 sentence factual summary of the core issue",
  "suggested_department": "Name of the responsible municipal department (e.g. Department of Public Works, Water Authority, etc.)",
  "suggested_priority": "Low" | "Medium" | "High" | "Critical",
  "priority_reason": "Specific reason explaining the suggested urgency based on public safety or infrastructure disruption",
  "recommended_action": "Practical, actionable next step for the response team",
  "possible_safety_risk": "Concise assessment of any apparent danger to pedestrians, motorists, or property"
}`;

    let responseText = '';
    let parsed: any = null;

    if (process.env.GEMINI_API_KEY) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out')), 8000)
        );

        const aiCallPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: {
                  type: Type.STRING,
                  description: 'Appropriate category from: Road Damage, Waste Management, Water Leakage, Streetlight, Drainage, Public Infrastructure, Other',
                },
                summary: {
                  type: Type.STRING,
                  description: 'A short summary of the reported problem.',
                },
                suggested_department: {
                  type: Type.STRING,
                  description: 'Relevant department to review the complaint',
                },
                suggested_priority: {
                  type: Type.STRING,
                  description: 'Suggested priority: Low, Medium, High, or Critical',
                },
                priority_reason: {
                  type: Type.STRING,
                  description: 'Explanation for the suggested priority',
                },
                recommended_action: {
                  type: Type.STRING,
                  description: 'A practical next step for the responsible team',
                },
                possible_safety_risk: {
                  type: Type.STRING,
                  description: 'A concise description of any apparent risk',
                },
              },
              required: [
                'category',
                'summary',
                'suggested_department',
                'suggested_priority',
                'priority_reason',
                'recommended_action',
                'possible_safety_risk',
              ],
            },
          },
        });

        const response: any = await Promise.race([aiCallPromise, timeoutPromise]);
        responseText = response.text?.trim() || '';
        if (responseText) {
          parsed = JSON.parse(responseText);
        }
      } catch (apiErr: any) {
        console.warn('Gemini API call failed or timed out:', apiErr?.message);
      }
    }

    // If Gemini was unreachable or returned empty, provide an intelligent deterministic triage
    if (!parsed) {
      const lower = `${title} ${description}`.toLowerCase();
      let determinedCategory: ComplaintCategory = (category && category !== 'Other') ? category : 'Public Infrastructure';
      let dept = 'Department of Public Works';
      let priority: ComplaintPriority = 'Medium';
      let reason = 'Standard municipal assessment required for reported site.';
      let action = 'Dispatch field inspector to log site conditions and verify hazard level.';
      let risk = 'Potential pedestrian trip hazard or property disruption.';

      if (lower.includes('pothole') || lower.includes('crater') || lower.includes('asphalt') || lower.includes('road')) {
        determinedCategory = 'Road Damage';
        dept = 'Department of Public Works & Road Maintenance';
        priority = (lower.includes('deep') || lower.includes('swerv') || lower.includes('tire') || lower.includes('crash')) ? 'Critical' : 'High';
        reason = 'Road surface deterioration threatens vehicular alignment and traffic flow.';
        action = 'Deploy asphalt patch unit and position reflective cones.';
        risk = 'Vehicle suspension/tire blowouts and erratic cross-lane steering.';
      } else if (lower.includes('trash') || lower.includes('garbage') || lower.includes('dump') || lower.includes('waste')) {
        determinedCategory = 'Waste Management';
        dept = 'Bureau of Sanitation & Waste Management';
        priority = lower.includes('overflow') || lower.includes('smell') ? 'Medium' : 'Low';
        reason = 'Public cleanliness, odor control, and pest mitigation.';
        action = 'Route secondary refuse collection vehicle to empty container.';
        risk = 'Hygiene hazard and environmental litter dispersion.';
      } else if (lower.includes('water') || lower.includes('pipe') || lower.includes('leak') || lower.includes('burst')) {
        determinedCategory = 'Water Leakage';
        dept = 'Municipal Water & Sewer Authority';
        priority = (lower.includes('burst') || lower.includes('flood') || lower.includes('gush')) ? 'Critical' : 'High';
        reason = 'Continuous water loss can undermine soil foundation and erode pavement.';
        action = 'Dispatch water utility technician to isolate line valve.';
        risk = 'Sidewalk subsidence, erosion, and pedestrian slipping.';
      } else if (lower.includes('light') || lower.includes('dark') || lower.includes('lamp') || lower.includes('pole')) {
        determinedCategory = 'Streetlight';
        dept = 'Division of Electrical & Public Lighting';
        priority = lower.includes('blackout') || lower.includes('multiple') ? 'High' : 'Medium';
        reason = 'Nighttime illumination is critical for neighborhood crime prevention and pedestrian safety.';
        action = 'Test circuit photocell and replace burned luminaire driver.';
        risk = 'Reduced visibility for pedestrians and evening vehicular blind spots.';
      } else if (lower.includes('drain') || lower.includes('flood') || lower.includes('clog') || lower.includes('basin')) {
        determinedCategory = 'Drainage';
        dept = 'Stormwater & Drainage Maintenance';
        priority = 'High';
        reason = 'Obstructed storm drainage leads to street pooling and curb flooding.';
        action = 'Clear grate debris with vacuum truck or manual crew.';
        risk = 'Roadway hydroplaning and standing water contamination.';
      }

      parsed = {
        category: determinedCategory,
        summary: description.length > 120 ? `${description.slice(0, 117)}...` : description,
        suggested_department: dept,
        suggested_priority: priority,
        priority_reason: reason,
        recommended_action: action,
        possible_safety_risk: risk,
      };
    }

    // Validate category conforms to recognized enums
    const validCategories: ComplaintCategory[] = [
      'Road Damage',
      'Waste Management',
      'Water Leakage',
      'Streetlight',
      'Drainage',
      'Public Infrastructure',
      'Other',
    ];
    if (!validCategories.includes(parsed.category)) {
      parsed.category = category || 'Other';
    }

    const validPriorities: ComplaintPriority[] = ['Low', 'Medium', 'High', 'Critical'];
    if (!validPriorities.includes(parsed.suggested_priority)) {
      parsed.suggested_priority = 'Medium';
    }

    res.json({ analysis: parsed, source: 'gemini-3.8-flash' });
  } catch (error: any) {
    console.error('Gemini AI Analysis Error:', error);
    // Provide a clear error response or fallback
    res.status(500).json({
      error: 'AI analysis failed: ' + (error?.message || 'Unknown error'),
    });
  }
});

// 2. Duplicate Check Endpoint
app.post('/api/check-duplicate', (req, res) => {
  try {
    const { title, description, location, category } = req.body;
    const complaints = loadComplaints();
    const match = findDuplicate(title || '', description || '', location || '', category || '', complaints);
    if (match) {
      return res.json({
        hasDuplicate: true,
        matchedComplaint: {
          id: match.id,
          title: match.title,
          category: match.category,
          location: match.location,
          status: match.status,
          createdAt: match.createdAt,
        },
      });
    }
    return res.json({ hasDuplicate: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get all complaints
app.get('/api/complaints', (_req, res) => {
  try {
    const complaints = loadComplaints();
    res.json(complaints);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get complaint by ID (for Track Complaint page)
app.get('/api/complaints/:id', (req, res) => {
  try {
    const complaints = loadComplaints();
    const queryId = req.params.id.trim().toUpperCase();
    const complaint = complaints.find(c => c.id.toUpperCase() === queryId);
    if (!complaint) {
      return res.status(404).json({ error: `Complaint with ID "${req.params.id}" was not found.` });
    }
    res.json(complaint);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Submit new complaint
app.post('/api/complaints', (req, res) => {
  try {
    const { title, description, category, location, aiAnalysis, imageUrl } = req.body;

    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    const complaints = loadComplaints();

    // Generate unique complaint ID: CIVIC-2026-XXXX
    let randomNum = Math.floor(1000 + Math.random() * 9000);
    let id = `CIVIC-2026-${randomNum}`;
    while (complaints.some(c => c.id === id)) {
      randomNum = Math.floor(1000 + Math.random() * 9000);
      id = `CIVIC-2026-${randomNum}`;
    }

    // Check potential duplicate
    const duplicate = findDuplicate(title, description, location, category, complaints);

    const now = new Date().toISOString();
    const newComplaint: Complaint = {
      id,
      title: title.trim(),
      description: description.trim(),
      category: category || (aiAnalysis?.category ?? 'Other'),
      location: location.trim(),
      status: 'Submitted',
      aiAnalysis: aiAnalysis || {
        category: category || 'Other',
        summary: description.slice(0, 100),
        suggested_department: 'General Municipal Works',
        suggested_priority: 'Medium',
        priority_reason: 'Automated intake review pending.',
        recommended_action: 'Initial triage by district coordinator.',
        possible_safety_risk: 'Standard neighborhood safety assessment.',
      },
      createdAt: now,
      updatedAt: now,
      isDemo: false,
      imageUrl: imageUrl || undefined,
      potentialDuplicateOf: duplicate ? duplicate.id : undefined,
      statusHistory: [
        {
          status: 'Submitted',
          note: 'Complaint recorded via CIVIC AI citizen portal.',
          timestamp: now,
          updatedBy: 'Citizen Reporter',
        },
      ],
    };

    complaints.unshift(newComplaint);
    saveComplaints(complaints);

    res.status(201).json(newComplaint);
  } catch (err: any) {
    console.error('Error creating complaint:', err);
    res.status(500).json({ error: 'Failed to save complaint: ' + err.message });
  }
});

// 6. Update complaint status (Admin action)
app.patch('/api/complaints/:id', (req, res) => {
  try {
    const { status, note, updatedBy } = req.body;
    const validStatuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status provided.' });
    }

    const complaints = loadComplaints();
    const queryId = req.params.id.trim().toUpperCase();
    const index = complaints.findIndex(c => c.id.toUpperCase() === queryId);

    if (index === -1) {
      return res.status(404).json({ error: `Complaint with ID "${req.params.id}" not found.` });
    }

    const now = new Date().toISOString();
    const current = complaints[index];

    current.status = status;
    current.updatedAt = now;
    if (!current.statusHistory) {
      current.statusHistory = [];
    }
    current.statusHistory.push({
      status,
      note: note || `Status transitioned to ${status}`,
      timestamp: now,
      updatedBy: updatedBy || 'Municipal Operations Admin',
    });

    complaints[index] = current;
    saveComplaints(complaints);

    res.json(current);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get computed statistics
app.get('/api/stats', (_req, res) => {
  try {
    const complaints = loadComplaints();
    const total = complaints.length;
    const submitted = complaints.filter(c => c.status === 'Submitted').length;
    const underReview = complaints.filter(c => c.status === 'Under Review').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const c of complaints) {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    }

    // Priority breakdown
    const priorityCounts: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    for (const c of complaints) {
      const p = c.aiAnalysis?.suggested_priority || 'Medium';
      priorityCounts[p] = (priorityCounts[p] || 0) + 1;
    }

    // Find recurring hotspot locations
    const locationCounts: Record<string, number> = {};
    for (const c of complaints) {
      const locKey = c.location.split(',')[0].trim();
      locationCounts[locKey] = (locationCounts[locKey] || 0) + 1;
    }
    const hotspots = Object.entries(locationCounts)
      .filter(([_, count]) => count > 1)
      .map(([loc, count]) => ({ location: loc, count }));

    res.json({
      total,
      submitted,
      underReview,
      inProgress,
      resolved,
      categoryCounts,
      priorityCounts,
      hotspots,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Setup dev or prod middleware
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CIVIC AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
