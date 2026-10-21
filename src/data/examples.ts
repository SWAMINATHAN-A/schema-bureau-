export interface ExampleSchema {
  id: string;
  name: string;
  domain: string;
  summary: string;
  tables: string[];
  concepts: string[];
  sql: string;
}

export const EXAMPLES: ExampleSchema[] = [
{
  id: 'university',
  name: 'University Management',
  domain: 'Education',
  summary:
  'Departments, students, instructors and courses, with Enrollment acting as an associative entity between students and courses.',
  tables: ['Department', 'Student', 'Instructor', 'Course', 'Enrollment'],
  concepts: ['Composite key', 'Junction table', 'Optional relationship'],
  sql: `CREATE TABLE Department (
    department_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    building VARCHAR(60),
    budget DECIMAL(12,2) DEFAULT 0.00
);

CREATE TABLE Instructor (
    instructor_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    hired_on DATE,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE,
    enrolled_on DATE DEFAULT CURRENT_DATE,
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Course (
    course_id INT PRIMARY KEY,
    code VARCHAR(12) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    credits SMALLINT NOT NULL DEFAULT 3,
    department_id INT NOT NULL,
    instructor_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(department_id),
    FOREIGN KEY (instructor_id) REFERENCES Instructor(instructor_id)
);

CREATE TABLE Enrollment (
    student_id INT NOT NULL,
    course_id INT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    grade CHAR(2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);`
},
{
  id: 'ecommerce',
  name: 'E-Commerce Platform',
  domain: 'Retail',
  summary:
  'Customers place orders made of order items; each order has exactly one payment, demonstrating a one-to-one relationship.',
  tables: ['Customer', 'Product', 'Orders', 'OrderItem', 'Payment'],
  concepts: ['One-to-one', 'Line items', 'Money types'],
  sql: `CREATE TABLE Customer (
    customer_id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Product (
    product_id INT PRIMARY KEY AUTO_INCREMENT,
    sku VARCHAR(40) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE Orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    placed_at DATETIME NOT NULL,
    status VARCHAR(24) NOT NULL DEFAULT 'PENDING',
    total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id)
);

CREATE TABLE OrderItem (
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (order_id, product_id),
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (product_id) REFERENCES Product(product_id)
);

CREATE TABLE Payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL UNIQUE,
    method VARCHAR(30) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_at DATETIME,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);`
},
{
  id: 'hospital',
  name: 'Hospital Records',
  domain: 'Healthcare',
  summary:
  'Appointments join patients and doctors, and prescriptions hang off appointments — a chain of many-to-one relationships.',
  tables: ['Patient', 'Doctor', 'Appointment', 'Prescription'],
  concepts: ['Chained relationships', 'Temporal types', 'Optional links'],
  sql: `CREATE TABLE Patient (
    patient_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    date_of_birth DATE NOT NULL,
    blood_group VARCHAR(5),
    phone VARCHAR(30) UNIQUE
);

CREATE TABLE Doctor (
    doctor_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    specialty VARCHAR(80) NOT NULL,
    license_no VARCHAR(40) NOT NULL UNIQUE
);

CREATE TABLE Appointment (
    appointment_id INT PRIMARY KEY,
    patient_id INT NOT NULL,
    doctor_id INT NOT NULL,
    scheduled_for DATETIME NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id)
);

CREATE TABLE Prescription (
    prescription_id INT PRIMARY KEY,
    appointment_id INT NOT NULL,
    medication VARCHAR(120) NOT NULL,
    dosage VARCHAR(60) NOT NULL,
    days SMALLINT NOT NULL DEFAULT 7,
    issued_on DATE NOT NULL,
    FOREIGN KEY (appointment_id) REFERENCES Appointment(appointment_id)
);`
},
{
  id: 'banking',
  name: 'Retail Banking',
  domain: 'Finance',
  summary:
  'Branches hold accounts for customers, and transactions record movement on an account — including transfers to another account.',
  tables: ['Branch', 'Customer', 'Account', 'Transaction'],
  concepts: ['Two FKs to one table', 'Numeric precision', 'Audit trail'],
  sql: `CREATE TABLE Branch (
    branch_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(80) NOT NULL,
    swift_code VARCHAR(11) UNIQUE
);

CREATE TABLE Customer (
    customer_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    national_id VARCHAR(40) NOT NULL UNIQUE,
    email VARCHAR(150),
    joined_on DATE NOT NULL
);

CREATE TABLE Account (
    account_id BIGINT PRIMARY KEY,
    customer_id INT NOT NULL,
    branch_id INT NOT NULL,
    account_type VARCHAR(20) NOT NULL DEFAULT 'CHECKING',
    balance DECIMAL(14,2) NOT NULL DEFAULT 0.00,
    opened_on DATE NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES Customer(customer_id),
    FOREIGN KEY (branch_id) REFERENCES Branch(branch_id)
);

CREATE TABLE Transaction (
    transaction_id BIGINT PRIMARY KEY,
    account_id BIGINT NOT NULL,
    counterparty_account_id BIGINT,
    amount DECIMAL(14,2) NOT NULL,
    direction VARCHAR(6) NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    description VARCHAR(200),
    FOREIGN KEY (account_id) REFERENCES Account(account_id),
    FOREIGN KEY (counterparty_account_id) REFERENCES Account(account_id)
);`
},
{
  id: 'library',
  name: 'Library System',
  domain: 'Public services',
  summary:
  'BookAuthor is a pure junction table between Book and Author, while Loan tracks which member currently holds a book.',
  tables: ['Book', 'Author', 'BookAuthor', 'Member', 'Loan'],
  concepts: ['Pure junction table', 'Many-to-many', 'Nullable return date'],
  sql: `CREATE TABLE Author (
    author_id INT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    country VARCHAR(60),
    born_in SMALLINT
);

CREATE TABLE Book (
    book_id INT PRIMARY KEY,
    isbn VARCHAR(17) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    published_year SMALLINT,
    copies INT NOT NULL DEFAULT 1
);

CREATE TABLE BookAuthor (
    book_id INT NOT NULL,
    author_id INT NOT NULL,
    PRIMARY KEY (book_id, author_id),
    FOREIGN KEY (book_id) REFERENCES Book(book_id),
    FOREIGN KEY (author_id) REFERENCES Author(author_id)
);

CREATE TABLE Member (
    member_id INT PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE,
    joined_on DATE NOT NULL
);

CREATE TABLE Loan (
    loan_id INT PRIMARY KEY,
    book_id INT NOT NULL,
    member_id INT NOT NULL,
    borrowed_on DATE NOT NULL,
    due_on DATE NOT NULL,
    returned_on DATE,
    FOREIGN KEY (book_id) REFERENCES Book(book_id),
    FOREIGN KEY (member_id) REFERENCES Member(member_id)
);`
},
{
  id: 'org-hierarchy',
  name: 'Org Hierarchy',
  domain: 'Teaching example',
  summary:
  'A single table whose foreign key points back at itself — the canonical self-referencing relationship.',
  tables: ['Employee'],
  concepts: ['Self-reference', 'Hierarchy', 'Nullable FK'],
  sql: `CREATE TABLE Employee (
    employee_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    title VARCHAR(80),
    hired_on DATE NOT NULL,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES Employee(employee_id)
);`
}];


export const DEFAULT_SQL = `CREATE TABLE Department (
    department_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    department_id INT,
    FOREIGN KEY (department_id)
        REFERENCES Department(department_id)
);`;