const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
const Announcement = require('../models/Announcement');

const seedDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/placementDB';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Connected to MongoDB for seeding (${uri})`);

    // Clear existing data
    await User.deleteMany({});
    await Job.deleteMany({});
    await Application.deleteMany({});
    await Announcement.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Dr. Placement Admin',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin',
    });

    // Create Recruiters
    const recruiters = await User.create([
      {
        name: 'Rahul Sharma',
        email: 'rahul@google.com',
        password: 'recruiter123',
        role: 'recruiter',
        recruiterProfile: {
          company: 'Google',
          designation: 'HR Manager',
          companyWebsite: 'https://google.com',
          companyDescription: 'A multinational technology company specializing in Internet-related services.',
          industry: 'Technology',
          companySize: '10000+',
          location: 'Bangalore, India',
          phone: '+91 9876543210',
        },
      },
      {
        name: 'Priya Patel',
        email: 'priya@microsoft.com',
        password: 'recruiter123',
        role: 'recruiter',
        recruiterProfile: {
          company: 'Microsoft',
          designation: 'Talent Acquisition Lead',
          companyWebsite: 'https://microsoft.com',
          companyDescription: 'A global technology corporation that produces computer software and electronics.',
          industry: 'Technology',
          companySize: '10000+',
          location: 'Hyderabad, India',
          phone: '+91 9876543211',
        },
      },
      {
        name: 'Amit Kumar',
        email: 'amit@infosys.com',
        password: 'recruiter123',
        role: 'recruiter',
        recruiterProfile: {
          company: 'Infosys',
          designation: 'Campus Recruitment Head',
          companyWebsite: 'https://infosys.com',
          companyDescription: 'A global leader in next-generation digital services and consulting.',
          industry: 'IT Services',
          companySize: '10000+',
          location: 'Pune, India',
          phone: '+91 9876543212',
        },
      },
    ]);

    // Create Students
    const students = await User.create([
      {
        name: 'Ananya Gupta',
        email: 'ananya@student.edu',
        password: 'student123',
        role: 'student',
        studentProfile: {
          education: 'B.Tech Computer Science',
          department: 'Computer Science',
          batch: '2024',
          gpa: 9.2,
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
          phone: '+91 9876543213',
          bio: 'Passionate full-stack developer with experience in MERN stack.',
          linkedin: 'https://linkedin.com/in/ananya',
          github: 'https://github.com/ananya',
        },
      },
      {
        name: 'Vikram Singh',
        email: 'vikram@student.edu',
        password: 'student123',
        role: 'student',
        studentProfile: {
          education: 'B.Tech Information Technology',
          department: 'Information Technology',
          batch: '2024',
          gpa: 8.5,
          skills: ['Java', 'Spring Boot', 'SQL', 'AWS', 'Docker'],
          phone: '+91 9876543214',
          bio: 'Backend developer with strong problem-solving skills.',
          linkedin: 'https://linkedin.com/in/vikram',
          github: 'https://github.com/vikram',
        },
      },
      {
        name: 'Sneha Reddy',
        email: 'sneha@student.edu',
        password: 'student123',
        role: 'student',
        studentProfile: {
          education: 'B.Tech Electronics',
          department: 'Electronics & Communication',
          batch: '2024',
          gpa: 8.0,
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Analysis'],
          phone: '+91 9876543215',
          bio: 'AI/ML enthusiast looking for data science roles.',
          linkedin: 'https://linkedin.com/in/sneha',
          github: 'https://github.com/sneha',
        },
      },
      {
        name: 'Rohit Mehra',
        email: 'rohit@student.edu',
        password: 'student123',
        role: 'student',
        studentProfile: {
          education: 'B.Tech Computer Science',
          department: 'Computer Science',
          batch: '2025',
          gpa: 7.5,
          skills: ['HTML', 'CSS', 'JavaScript', 'React'],
          phone: '+91 9876543216',
          bio: 'Frontend developer learning full-stack development.',
        },
      },
    ]);

    // Create Jobs
    const jobs = await Job.create([
      {
        title: 'Software Development Engineer',
        description: 'Join Google as an SDE and work on large-scale distributed systems. You will design, develop, test, deploy, maintain, and improve software across Google\'s products. You should be comfortable with algorithms, data structures, and software design.',
        company: 'Google',
        recruiter: recruiters[0]._id,
        type: 'full-time',
        location: 'Bangalore, India',
        salary: { min: 1800000, max: 2500000, currency: 'INR' },
        requirements: {
          minGPA: 8.0,
          skills: ['JavaScript', 'Python', 'Data Structures', 'Algorithms', 'System Design'],
          batch: ['2024', '2025'],
          education: 'B.Tech/M.Tech',
        },
        responsibilities: [
          'Design and develop scalable software solutions',
          'Write clean, maintainable, and well-tested code',
          'Collaborate with cross-functional teams',
          'Participate in code reviews and design discussions',
        ],
        perks: ['Health Insurance', 'Free Meals', 'Stock Options', 'Gym Membership'],
        openings: 5,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'approved',
      },
      {
        title: 'Full Stack Developer Intern',
        description: 'Microsoft is looking for passionate interns to join our development team. Work on real-world projects using modern web technologies and cloud services.',
        company: 'Microsoft',
        recruiter: recruiters[1]._id,
        type: 'internship',
        location: 'Hyderabad, India',
        salary: { min: 50000, max: 80000, currency: 'INR' },
        requirements: {
          minGPA: 7.5,
          skills: ['React', 'Node.js', 'Azure', 'TypeScript'],
          batch: ['2025'],
          education: 'B.Tech',
        },
        responsibilities: [
          'Develop web applications using React and Node.js',
          'Work with Azure cloud services',
          'Participate in agile development sprints',
        ],
        perks: ['Stipend', 'Certificate', 'Pre-placement offer possibility'],
        openings: 10,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        status: 'approved',
      },
      {
        title: 'Systems Engineer',
        description: 'Infosys is hiring Systems Engineers for their digital services division. Work on enterprise applications and learn cutting-edge technologies.',
        company: 'Infosys',
        recruiter: recruiters[2]._id,
        type: 'full-time',
        location: 'Pune, India',
        salary: { min: 350000, max: 500000, currency: 'INR' },
        requirements: {
          minGPA: 6.5,
          skills: ['Java', 'SQL', 'Problem Solving'],
          batch: ['2024', '2025'],
          education: 'B.Tech/BCA/MCA',
        },
        responsibilities: [
          'Develop and maintain enterprise applications',
          'Work with Java and Spring framework',
          'Database design and optimization',
        ],
        perks: ['Health Insurance', 'Training Programs', 'Relocation Support'],
        openings: 50,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        status: 'approved',
      },
      {
        title: 'Data Science Analyst',
        description: 'Google is looking for data science analysts to derive insights from large datasets and build ML models.',
        company: 'Google',
        recruiter: recruiters[0]._id,
        type: 'full-time',
        location: 'Bangalore, India',
        salary: { min: 2000000, max: 2800000, currency: 'INR' },
        requirements: {
          minGPA: 8.5,
          skills: ['Python', 'Machine Learning', 'TensorFlow', 'Statistics', 'SQL'],
          batch: ['2024'],
          education: 'B.Tech/M.Tech',
        },
        responsibilities: [
          'Analyze large datasets to derive business insights',
          'Build and deploy machine learning models',
          'Create data visualizations and dashboards',
        ],
        perks: ['Health Insurance', 'Free Meals', 'Stock Options', 'Remote Work'],
        openings: 3,
        deadline: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
        status: 'approved',
      },
      {
        title: 'Cloud Engineer',
        description: 'Microsoft Azure team is looking for cloud engineers to build and maintain cloud infrastructure.',
        company: 'Microsoft',
        recruiter: recruiters[1]._id,
        type: 'full-time',
        location: 'Noida, India',
        salary: { min: 1500000, max: 2200000, currency: 'INR' },
        requirements: {
          minGPA: 7.0,
          skills: ['AWS', 'Docker', 'Kubernetes', 'Linux', 'Python'],
          batch: ['2024'],
          education: 'B.Tech',
        },
        responsibilities: [
          'Design and maintain cloud infrastructure',
          'Implement CI/CD pipelines',
          'Monitor and optimize cloud resources',
        ],
        perks: ['Health Insurance', 'Stock Options', 'Flexible Hours'],
        openings: 8,
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    ]);

    // Create Applications
    const applications = await Application.create([
      {
        student: students[0]._id,
        job: jobs[0]._id,
        status: 'shortlisted',
        coverLetter: 'I am passionate about building scalable systems and would love to contribute to Google.',
        statusHistory: [
          { status: 'applied', changedBy: students[0]._id },
          { status: 'under-review', changedBy: recruiters[0]._id },
          { status: 'shortlisted', changedBy: recruiters[0]._id },
        ],
      },
      {
        student: students[0]._id,
        job: jobs[3]._id,
        status: 'applied',
        coverLetter: 'I have strong analytical skills and experience with Python and ML.',
        statusHistory: [{ status: 'applied', changedBy: students[0]._id }],
      },
      {
        student: students[1]._id,
        job: jobs[2]._id,
        status: 'interview-scheduled',
        coverLetter: 'I am excited about the opportunity to work at Infosys.',
        interviewDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        interviewLocation: 'Infosys Pune Campus',
        statusHistory: [
          { status: 'applied', changedBy: students[1]._id },
          { status: 'shortlisted', changedBy: recruiters[2]._id },
          { status: 'interview-scheduled', changedBy: recruiters[2]._id },
        ],
      },
      {
        student: students[1]._id,
        job: jobs[0]._id,
        status: 'selected',
        coverLetter: 'I am a strong backend developer ready for this challenge.',
        statusHistory: [
          { status: 'applied', changedBy: students[1]._id },
          { status: 'shortlisted', changedBy: recruiters[0]._id },
          { status: 'interview-scheduled', changedBy: recruiters[0]._id },
          { status: 'selected', changedBy: recruiters[0]._id },
        ],
        feedback: [{ from: recruiters[0]._id, message: 'Excellent technical skills and problem-solving ability.' }],
      },
      {
        student: students[2]._id,
        job: jobs[3]._id,
        status: 'under-review',
        coverLetter: 'As an AI/ML enthusiast, this role aligns perfectly with my career goals.',
        statusHistory: [
          { status: 'applied', changedBy: students[2]._id },
          { status: 'under-review', changedBy: recruiters[0]._id },
        ],
      },
    ]);

    // Update applicant counts
    await Job.findByIdAndUpdate(jobs[0]._id, { applicantCount: 2 });
    await Job.findByIdAndUpdate(jobs[2]._id, { applicantCount: 1 });
    await Job.findByIdAndUpdate(jobs[3]._id, { applicantCount: 2 });

    // Create Announcements
    await Announcement.create([
      {
        title: 'Placement Season 2024 Begins!',
        content: 'The campus placement season for 2024 batch has officially started. All eligible students are requested to complete their profiles and upload their latest resumes. Companies will begin posting job openings from this week.',
        author: admin._id,
        priority: 'high',
        tags: ['placement', '2024', 'important'],
      },
      {
        title: 'Resume Workshop - Next Week',
        content: 'The Placement Cell is organizing a resume building workshop next Monday at 2:00 PM in the Seminar Hall. Industry experts from Google and Microsoft will guide students on creating impactful resumes. All students are encouraged to attend.',
        author: admin._id,
        priority: 'medium',
        tags: ['workshop', 'resume'],
      },
      {
        title: 'Mock Interview Drive',
        content: 'A mock interview drive will be conducted next Friday. Students who have been shortlisted for any company are strongly advised to participate. Register through the portal by Wednesday.',
        author: admin._id,
        priority: 'medium',
        tags: ['interview', 'preparation'],
      },
    ]);

    console.log('✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin:     admin@college.edu / admin123');
    console.log('Recruiter: rahul@google.com / recruiter123');
    console.log('Recruiter: priya@microsoft.com / recruiter123');
    console.log('Recruiter: amit@infosys.com / recruiter123');
    console.log('Student:   ananya@student.edu / student123');
    console.log('Student:   vikram@student.edu / student123');
    console.log('Student:   sneha@student.edu / student123');
    console.log('Student:   rohit@student.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedDB();
