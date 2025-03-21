# University Online Course Registration System

Hey there! This is my university project - an online course registration system. It lets students check out available courses, sign up, and register for them online. I also added a cool admin panel where lecturers can review student applications.

## What it does

### For Students:
- Browse through all available courses without needing to log in
- Create a new account with your details
- Log in to your existing account
- See all the course details
- Register for courses you're interested in
- Keep track of your course registrations

### For Staff:
- Login portal just for lecturers
- Dashboard to check student applications and their qualifications
- Filter students by application status or course
- Accept or reject applications based on requirements

## Database Tables

I'm using Supabase with these tables:

- **student2**: Stores all student info (ID, name, email, address, etc.)
- **course**: Has details about each course (code, name, description, location)
- **student_course**: Links students to the courses they're enrolled in
- Plus some other related tables for the university structure

## Login Details

### Students:
- Just register as a new student on the registration page

### Staff:
- **Lecturer:** 
  - Username: admin
  - Password: admin

## How it Works

1. Students browse available courses
2. They register with their personal details
3. They choose courses they want to take
4. Lecturers review their applications
5. Lecturers approve or reject applications based on qualifications
6. Approved students can carry on with their chosen courses

## Tech Stuff I Used

- Frontend: HTML, CSS, JavaScript (nothing fancy, just the basics)
- Backend: Supabase (way easier than setting up a server myself)
- Authentication: Built-in Supabase Auth

## How to Run It

1. Clone this repo
2. Set up a Supabase project with the right tables
3. Copy `config.example.js` to `config.js` and put in your Supabase details:
   ```javascript
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
   ```
4. Run with any basic web server (I use `python -m http.server` cause it's quick)

Feedback welcome! Let me know if you have any questions. 