const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('../src/models/User');
const Resource = require('../src/models/Resource');

const sampleResources = [
  {
    name: 'Dell Precision 5570 Workstation Laptop',
    description: 'High-performance mobile workstation equipped with Intel Core i7, 32GB RAM, and NVIDIA RTX graphics for CAD, simulation, and software development.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    location: 'Lab 402, Technology Building',
    totalQuantity: 8,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Apple MacBook Pro 16" M2 Max',
    description: '12-core CPU, 38-core GPU, 32GB unified memory with Liquid Retina XDR display for iOS development, video production, and deep learning.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    location: 'Mobile Development Center, Lab 305',
    totalQuantity: 6,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Sony Alpha 7 IV Mirrorless Camera Kit',
    description: 'Full-frame 33MP hybrid camera with 28-70mm lens, dual 128GB high-speed SD cards, camera cage, and spare batteries for media production.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&auto=format&fit=crop&q=80',
    department: 'Media & Communications',
    location: 'Media Center Room 105',
    totalQuantity: 5,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Canon EOS R6 Mark II 4K Video Kit',
    description: 'Professional 4K 60p full-width cinema kit with 24-105mm F4 L lens, ND filters, shotgun mic, and lightweight tripod for events.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600&auto=format&fit=crop&q=80',
    department: 'Media & Communications',
    location: 'Media Center Room 105',
    totalQuantity: 4,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Epson Pro EX9240 Full HD Projector',
    description: 'Wireless 4,000 lumens 1080p wireless business projector with HDMI input and high contrast ratio for classroom presentations.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    department: 'Audio-Visual Center',
    location: 'AV Resource Desk, Main Library',
    totalQuantity: 5,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'BenQ 4K HDR Laser Conference Projector',
    description: '5,000 ANSI lumens 4K UHD laser installation projector with ultra-short throw for large venue seminars and lecture halls.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    department: 'Audio-Visual Center',
    location: 'AV Resource Desk, Main Library',
    totalQuantity: 3,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Shure Wireless Lapel & Handheld Mic Kit',
    description: 'Dual channel UHF wireless microphone system with receiver, handheld mic, and lavalier bodypack transmitter for guest speakers.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=600&auto=format&fit=crop&q=80',
    department: 'Audio-Visual Center',
    location: 'AV Resource Desk, Main Library',
    totalQuantity: 6,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Rode Wireless PRO Dual Audio Recording Kit',
    description: 'Dual-channel wireless microphone system with 32-bit float on-board recording, timecode sync, and broadcast-grade lavaliers.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=600&auto=format&fit=crop&q=80',
    department: 'Media & Communications',
    location: 'Media Center Room 105',
    totalQuantity: 4,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Apple iPad Pro 12.9" with Apple Pencil 2',
    description: 'M2 chip, 256GB storage, Liquid Retina display, with Apple Pencil and Magic Keyboard for architectural sketching and digital UI design.',
    category: 'Electronics',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=80',
    department: 'Architecture & Design',
    location: 'Design Studio 204',
    totalQuantity: 10,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Keysight Digital Storage Oscilloscope 100MHz',
    description: '2-channel digital storage oscilloscope with 1 GSa/s sampling rate, color display, math waveforms, and full probe kit.',
    category: 'Laboratory Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
    department: 'Electrical Engineering',
    location: 'Circuits Lab 203',
    totalQuantity: 12,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Arduino IoT Developer Kits Suite',
    description: 'All-inclusive Arduino MKR WiFi 1010 kit with sensor modules, actuator shields, breadboards, and documentation for embedded prototypes.',
    category: 'Laboratory Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?w=600&auto=format&fit=crop&q=80',
    department: 'Robotics & Automation',
    location: 'Robotics Lab 310',
    totalQuantity: 15,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Raspberry Pi 4 Model B Embedded Lab Kit',
    description: 'Broadcom 1.5GHz quad-core with 8GB RAM, 64GB MicroSD, camera module, touch display, and active cooling case for IoT research.',
    category: 'Laboratory Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&auto=format&fit=crop&q=80',
    department: 'Computer Science & Engineering',
    location: 'Embedded Systems Lab 404',
    totalQuantity: 14,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Formlabs Form 3+ SLA Precision 3D Printer',
    description: 'High-resolution industrial stereolithography 3D printer for medical engineering, fine mechanical gears, and student prototypes.',
    category: 'Laboratory Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=600&auto=format&fit=crop&q=80',
    department: 'Mechanical Engineering',
    location: 'Fabrication Workshop 102',
    totalQuantity: 3,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Olympus Binocular Research Compound Microscope',
    description: 'Achromatic objectives 4x, 10x, 40x, 100x oil immersion with mechanical stage, LED illumination, and USB digital camera eyepiece.',
    category: 'Laboratory Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=600&auto=format&fit=crop&q=80',
    department: 'Biotechnology & Chemistry',
    location: 'Bio-Science Lab 201',
    totalQuantity: 8,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Tournament Cricket Match Kit',
    description: 'Full tournament English Willow bats, protective pads, helmets, leather match balls, batting gloves, and durable kit bags.',
    category: 'Sports Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=600&auto=format&fit=crop&q=80',
    department: 'Athletics & Physical Education',
    location: 'Sports Complex Store 01',
    totalQuantity: 6,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Yonex Badminton Racket & Shuttlecock Set',
    description: 'Carbon fiber graphite frame rackets with synthetic gut string, carrying cases, and tournament feather shuttlecocks.',
    category: 'Sports Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&auto=format&fit=crop&q=80',
    department: 'Athletics & Physical Education',
    location: 'Indoor Gymnasium Counter',
    totalQuantity: 12,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Spalding Precision TF-1000 Basketballs & Cones',
    description: 'Indoor composite leather tournament match basketballs with high-visibility agility cones and ball inflator.',
    category: 'Sports Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=600&auto=format&fit=crop&q=80',
    department: 'Athletics & Physical Education',
    location: 'Indoor Gymnasium Counter',
    totalQuantity: 10,
    condition: 'Good',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'FIFA Pro Match Size 5 Football & Training Kit',
    description: 'Thermal bonded match soccer balls with captain armbands, bibs, agility ladders, and boundary markers for college matches.',
    category: 'Sports Equipment',
    resourceType: 'equipment',
    imageUrl: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&auto=format&fit=crop&q=80',
    department: 'Athletics & Physical Education',
    location: 'Sports Complex Store 01',
    totalQuantity: 8,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: true,
  },
  {
    name: 'Dr. APJ Abdul Kalam Seminar Hall',
    description: 'Tiered 250-seat acoustically treated auditorium with dual HD projection, surround sound, stage lighting, and presidential podium.',
    category: 'Rooms and Facilities',
    resourceType: 'facility',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    department: 'Campus Facilities Administration',
    location: 'Block A, Ground Floor',
    totalQuantity: 1,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: false,
  },
  {
    name: 'Executive Conference Room 301',
    description: '20-person executive boardroom with Polycom 4K video conferencing system, presentation screens, and smart whiteboard.',
    category: 'Rooms and Facilities',
    resourceType: 'room',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop&q=80',
    department: 'Administration',
    location: 'Administrative Tower Level 3',
    totalQuantity: 1,
    condition: 'New',
    operationalStatus: 'available',
    requiresIssueReturn: false,
  },
];

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    console.log('[Seed] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);

    // 1. Seed or Update Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@college.edu').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(adminPassword, salt);

      admin = await User.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        studentId: 'STAFF-ADMIN-01',
        department: 'Resource Management Center',
        phone: '+1 555-0199',
        role: 'admin',
        isActive: true,
      });
      console.log(`[Seed] Admin user created: ${adminEmail}`);
    } else {
      console.log(`[Seed] Admin user verified: ${adminEmail}`);
    }

    // 2. Seed or Update Default Student Account
    const studentEmail = 'student@college.edu';
    const studentPassword = 'Password123!';
    const studentId = 'CS2026-088';
    let student = await User.findOne({ $or: [{ email: studentEmail }, { studentId }] });
    const salt = await bcrypt.genSalt(10);
    const studentPasswordHash = await bcrypt.hash(studentPassword, salt);

    if (!student) {
      student = await User.create({
        name: 'Jane Doe',
        email: studentEmail,
        passwordHash: studentPasswordHash,
        studentId: studentId,
        department: 'Computer Science & Engineering',
        phone: '+1 555-0144',
        role: 'student',
        isActive: true,
      });
      console.log(`[Seed] Demo Student created: ${studentEmail} (Student ID: ${studentId})`);
    } else {
      student.passwordHash = studentPasswordHash;
      student.email = studentEmail;
      student.studentId = studentId;
      student.isActive = true;
      await student.save();
      console.log(`[Seed] Demo Student updated: ${studentEmail} (Student ID: ${studentId})`);
    }

    // 3. Ensure 20 Rich Products Stored in Database
    console.log(`[Seed] Updating database to store ${sampleResources.length} products...`);
    for (const item of sampleResources) {
      await Resource.findOneAndUpdate(
        { name: item.name },
        { $set: item },
        { upsert: true, new: true }
      );
    }

    const totalCount = await Resource.countDocuments({ isArchived: false });
    console.log(`[Seed] SUCCESS! Total active resources in database: ${totalCount}`);
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedDatabase();
