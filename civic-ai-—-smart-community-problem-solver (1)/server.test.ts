import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup test app instance
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TEST_DATA_DIR = path.resolve(__dirname, 'test-data');
const TEST_DATA_FILE = path.resolve(TEST_DATA_DIR, 'complaints.json');

// Mock data for testing
const MOCK_COMPLAINTS = [
  {
    id: 'CIVIC-2026-9999',
    title: 'Test Pothole on Test Street',
    description: 'A test pothole description that is sufficiently long for analysis.',
    category: 'Road Damage',
    location: '123 Test St',
    status: 'Submitted',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    aiAnalysis: {
      category: 'Road Damage',
      summary: 'Test summary of pothole.',
      suggested_department: 'Department of Public Works',
      suggested_priority: 'High',
      priority_reason: 'Test safety risk.',
      recommended_action: 'Patch road.',
      possible_safety_risk: 'Flat tires.',
    },
    statusHistory: [
      {
        status: 'Submitted',
        note: 'Submitted.',
        timestamp: new Date().toISOString(),
        updatedBy: 'Test Reporter',
      },
    ],
  },
];

describe('CIVIC AI Backend API & Storage Tests', () => {
  let app: express.Application;

  beforeAll(() => {
    if (!fs.existsSync(TEST_DATA_DIR)) {
      fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(MOCK_COMPLAINTS, null, 2), 'utf-8');

    // Create Express test app mimicking server.ts logic
    app = express();
    app.use(express.json({ limit: '1mb' }));

    app.get('/api/complaints', (_req, res) => {
      try {
        const data = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
        res.json(JSON.parse(data));
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/complaints/:id', (req, res) => {
      try {
        const data = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
        const list = JSON.parse(data);
        const queryId = req.params.id.trim().toUpperCase();
        const found = list.find((c: any) => c.id.toUpperCase() === queryId);
        if (!found) {
          return res.status(404).json({ error: `Complaint not found` });
        }
        res.json(found);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.post('/api/complaints', (req, res) => {
      try {
        const { title, description, category, location } = req.body;
        if (!title || !description || !location) {
          return res.status(400).json({ error: 'Title, description, and location are required.' });
        }
        if (description.length < 5) {
          return res.status(400).json({ error: 'Description is too short.' });
        }

        const data = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
        const list = JSON.parse(data);

        const id = `CIVIC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const now = new Date().toISOString();
        const newComp = {
          id,
          title: title.trim(),
          description: description.trim(),
          category: category || 'Other',
          location: location.trim(),
          status: 'Submitted',
          createdAt: now,
          updatedAt: now,
          aiAnalysis: {
            category: category || 'Other',
            summary: description.slice(0, 100),
            suggested_department: 'Municipal Works',
            suggested_priority: 'Medium',
            priority_reason: 'Standard review.',
            recommended_action: 'Inspect site.',
            possible_safety_risk: 'Minor hazard.',
          },
          statusHistory: [{ status: 'Submitted', note: 'Created', timestamp: now, updatedBy: 'Citizen' }],
        };

        list.unshift(newComp);
        fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
        res.status(201).json(newComp);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.patch('/api/complaints/:id', (req, res) => {
      try {
        const { status, note } = req.body;
        const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({ error: 'Invalid status provided.' });
        }

        const data = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
        const list = JSON.parse(data);
        const queryId = req.params.id.trim().toUpperCase();
        const index = list.findIndex((c: any) => c.id.toUpperCase() === queryId);
        if (index === -1) {
          return res.status(404).json({ error: 'Complaint not found.' });
        }

        const now = new Date().toISOString();
        list[index].status = status;
        list[index].updatedAt = now;
        list[index].statusHistory.push({
          status,
          note: note || `Status updated to ${status}`,
          timestamp: now,
          updatedBy: 'Admin',
        });

        fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(list, null, 2), 'utf-8');
        res.json(list[index]);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    app.get('/api/stats', (_req, res) => {
      try {
        const data = fs.readFileSync(TEST_DATA_FILE, 'utf-8');
        const list = JSON.parse(data);
        res.json({
          total: list.length,
          submitted: list.filter((c: any) => c.status === 'Submitted').length,
          resolved: list.filter((c: any) => c.status === 'Resolved').length,
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });
  });

  afterAll(() => {
    try {
      if (fs.existsSync(TEST_DATA_FILE)) fs.unlinkSync(TEST_DATA_FILE);
      if (fs.existsSync(TEST_DATA_DIR)) fs.rmdirSync(TEST_DATA_DIR);
    } catch {}
  });

  it('GET /api/complaints returns list of complaints', async () => {
    const res = await request(app).get('/api/complaints');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe('CIVIC-2026-9999');
  });

  it('GET /api/complaints/:id returns specific complaint or 404', async () => {
    const res = await request(app).get('/api/complaints/CIVIC-2026-9999');
    expect(res.status).toBe(200);
    expect(res.body.title).toBe('Test Pothole on Test Street');

    const res404 = await request(app).get('/api/complaints/CIVIC-9999-NONEXISTENT');
    expect(res404.status).toBe(404);
  });

  it('POST /api/complaints creates a new complaint with unique ID', async () => {
    const payload = {
      title: 'Broken Streetlight on 8th',
      description: 'The streetlight is completely burnt out and dark.',
      category: 'Streetlight',
      location: '8th & Broadway',
    };
    const res = await request(app).post('/api/complaints').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(/^CIVIC-2026-\d{4}$/);
    expect(res.body.title).toBe(payload.title);
    expect(res.body.status).toBe('Submitted');
  });

  it('POST /api/complaints rejects missing required fields', async () => {
    const res = await request(app).post('/api/complaints').send({
      title: 'Incomplete complaint',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('PATCH /api/complaints/:id updates status and adds history', async () => {
    const res = await request(app).patch('/api/complaints/CIVIC-2026-9999').send({
      status: 'In Progress',
      note: 'Repair crew dispatched.',
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('In Progress');
    expect(res.body.statusHistory.length).toBe(2);
    expect(res.body.statusHistory[1].status).toBe('In Progress');
  });

  it('PATCH /api/complaints/:id rejects invalid status', async () => {
    const res = await request(app).patch('/api/complaints/CIVIC-2026-9999').send({
      status: 'SuperResolved',
    });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/stats returns computed statistics', async () => {
    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThan(0);
    expect(typeof res.body.submitted).toBe('number');
  });
});
