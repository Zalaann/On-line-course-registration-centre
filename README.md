# University Online Course Registration System

A web-based system that allows prospective students to browse courses, register, and enroll in university courses. The system also includes administrative features for lecturers to approve qualifications and admission officers to verify student details.

## Features

### Student Features
- Browse available courses without logging in
- Register as a new student with personal details
- Login to existing account
- View detailed course information
- Enroll in courses
- Track enrollment status

### Admin Features
- Separate login for staff members (lecturers and admission officers)
- Lecturer dashboard to review student applications and check qualifications
- Admission officer dashboard to verify student details and generate credentials
- Filter applications by status and course
- Review and approve/reject student applications

## Database Structure

The system utilizes the following Supabase tables:

- **student2**: Stores student information (s_id, s_name, email, address, staffno)
- **course**: Stores course details (c_code, c_name, c_details, location)
- **student_course**: Junction table for student enrollments (s_id, c_code)
- Additional related tables (fulltime, parttime, personaltutor, student_book, book)

## Demo Credentials

### Student Access
- Register as a new student via the registration form

### Staff Access
- **Lecturer:** 
  - ID: L123
  - Password: password
  
- **Admission Officer:**
  - ID: O456
  - Password: password

## Application Workflow

1. Prospective students browse courses on the website
2. Students register with their personal details
3. Students select and enroll in courses
4. Lecturers review applications and check qualifications
5. Approved applications are forwarded to admission officers
6. Admission officers verify student details and complete registration
7. Students receive credentials to access the system

## Technical Implementation

- Frontend: HTML, CSS, JavaScript
- Backend: Supabase (PostgreSQL database with REST API)
- Authentication: Supabase Auth

## Setup and Installation

1. Clone the repository
2. Create a Supabase project and set up the necessary tables
3. Copy `config.example.js` to `config.js` and update with your Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'your-supabase-url';
   const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
   ```
4. Run the application using a local web server (e.g., `python -m http.server` or any other web server)

## License

[MIT License](LICENSE) 