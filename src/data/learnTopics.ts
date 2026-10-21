export interface Quiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface LearnTopic {
  id: string;
  group: 'Foundations' | 'Keys' | 'Relationships' | 'Advanced';
  title: string;
  oneLiner: string;
  body: string[];
  sql?: string;
  /** A tiny structural diagram rendered by the Learn page. */
  visual?: {
    kind: 'entity' | 'relationship' | 'junction' | 'hierarchy' | 'layers';
    left?: string;
    right?: string;
    middle?: string;
    leftCard?: string;
    rightCard?: string;
    label?: string;
    rows?: string[];
    layers?: {title: string;detail: string;}[];
  };
  quiz?: Quiz;
}

export const LEARN_TOPICS: LearnTopic[] = [
{
  id: 'database',
  group: 'Foundations',
  title: 'Database',
  oneLiner: 'A structured, persistent collection of related data managed by a DBMS.',
  body: [
  'A database is not just a pile of files: it is a managed store where structure, constraints and access are enforced by the database management system rather than by each application that touches it.',
  'Because the rules live with the data, two different programs writing to the same database cannot disagree about what a valid row looks like. That is the central promise of a DBMS, and it is why schema design matters more than any single query.'],

  quiz: {
    question: 'Why is it valuable for constraints to live in the database rather than in the application?',
    options: [
    'Because the database enforces them for every client, so the data cannot drift',
    'Because SQL runs faster than application code',
    'Because applications cannot validate data at all'],

    answer: 0,
    explanation:
    'Any number of applications, scripts and humans may touch the same database. Constraints stored with the data apply to all of them equally.'
  }
},
{
  id: 'table',
  group: 'Foundations',
  title: 'Table',
  oneLiner: 'A named set of rows, all sharing the same typed columns.',
  body: [
  'A table stores many instances of one kind of thing. Every row has exactly the same columns, and each column has a declared type that limits what may be stored in it.',
  'In SCHEMA BUREAU, every CREATE TABLE statement you write becomes one box on the canvas — the parser never guesses at tables you did not declare.'],

  sql: `CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE
);`,
  visual: {
    kind: 'entity',
    left: 'STUDENT',
    rows: ['PK  student_id  INT', '    name        VARCHAR(100)', '    email       VARCHAR(100)']
  }
},
{
  id: 'entity',
  group: 'Foundations',
  title: 'Entity',
  oneLiner: 'The conceptual thing a table represents.',
  body: [
  'An entity is a thing in the problem domain worth storing facts about: a student, an invoice, a flight. A table is how that entity is physically realised in a relational database.',
  'The distinction matters when you model. You decide entities by asking "what things does this business talk about?", not by asking "what columns do I need?".'],

  quiz: {
    question: 'A CREATE TABLE statement most directly produces which ER concept?',
    options: ['An entity', 'A relationship', 'An attribute'],
    answer: 0,
    explanation: 'Each table declares one kind of thing — an entity. Its columns become attributes.'
  }
},
{
  id: 'attribute',
  group: 'Foundations',
  title: 'Attribute',
  oneLiner: 'A single named property of an entity, constrained by a data type.',
  body: [
  'Columns become attributes. The data type is the attribute\'s domain — the set of values it may legally take — and NOT NULL decides whether the attribute is mandatory.',
  'Atomicity matters: an attribute should hold one value, not a comma-separated list. Storing "maths,physics" in one column is the most common first-normal-form violation.'],

  sql: `email       VARCHAR(100) NOT NULL UNIQUE,
created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
},
{
  id: 'primary-key',
  group: 'Keys',
  title: 'Primary Key',
  oneLiner: 'The attribute that uniquely identifies each row.',
  body: [
  'A primary key must be unique and non-null. It is the handle other tables use when they need to point at this entity, so choosing it well is the single most consequential decision in a table definition.',
  'Surrogate keys (an auto-generated integer) are stable and meaningless, which is usually an advantage. Natural keys (an email, an ISBN) carry meaning but change when the world changes.'],

  sql: `CREATE TABLE Book (
    book_id INT PRIMARY KEY,     -- surrogate
    isbn VARCHAR(17) UNIQUE      -- natural, still unique
);`,
  quiz: {
    question: 'Which pair of guarantees does a PRIMARY KEY constraint always provide?',
    options: ['Unique and not null', 'Indexed and sorted', 'Unique and auto-incrementing'],
    answer: 0,
    explanation: 'Auto-increment is optional and separate; uniqueness plus non-nullability is the definition.'
  }
},
{
  id: 'foreign-key',
  group: 'Keys',
  title: 'Foreign Key',
  oneLiner: 'A column whose values must already exist in another table.',
  body: [
  'A foreign key is how relational databases express a link. The engine refuses any row whose foreign key has no match in the referenced table — that guarantee is referential integrity.',
  'Nullability decides participation: a nullable foreign key means the relationship is optional on that side, while NOT NULL makes it mandatory.'],

  sql: `CREATE TABLE Student (
    student_id INT PRIMARY KEY,
    department_id INT,
    FOREIGN KEY (department_id)
        REFERENCES Department(department_id)
);`,
  visual: {
    kind: 'relationship',
    leftCard: 'Student',
    rightCard: 'Department',
    label: 'N:1'
  }
},
{
  id: 'composite-key',
  group: 'Keys',
  title: 'Composite Key',
  oneLiner: 'A primary key made of two or more columns.',
  body: [
  'When no single column identifies a row, the key becomes a combination. (student_id, course_id) identifies an enrollment because a student may take many courses and a course has many students, but a given pairing occurs once.',
  'A composite primary key made entirely of foreign keys is the signature of an associative entity.'],

  sql: `PRIMARY KEY (student_id, course_id)`,
  quiz: {
    question: 'What does PRIMARY KEY (student_id, course_id) guarantee?',
    options: [
    'Each student/course pairing appears at most once',
    'Each student appears at most once',
    'Each course appears at most once'],

    answer: 0,
    explanation: 'Only the combination is unique; either column alone may repeat freely.'
  }
},
{
  id: 'one-to-one',
  group: 'Relationships',
  title: 'One-to-One',
  oneLiner: 'Each row on one side matches at most one row on the other.',
  body: [
  'One-to-one appears when the foreign key also carries a UNIQUE constraint. Payment.order_id UNIQUE means an order can be paid once and a payment belongs to one order.',
  'Genuine one-to-one pairs are often candidates for a single table, unless the split exists to isolate optional, sensitive or rarely-read columns.'],

  sql: `CREATE TABLE Payment (
    payment_id INT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
);`,
  visual: { kind: 'relationship', leftCard: 'Orders', rightCard: 'Payment', label: '1:1' }
},
{
  id: 'one-to-many',
  group: 'Relationships',
  title: 'One-to-Many',
  oneLiner: 'The default shape: many rows reference one parent row.',
  body: [
  'The foreign key always lives on the "many" side. Many students belong to one department, so department_id sits on Student — never a list of students on Department.',
  'Read from the foreign key side and it is many-to-one; read from the parent side and the same edge is one-to-many. They describe the same constraint.'],

  visual: { kind: 'relationship', leftCard: 'Student', rightCard: 'Department', label: 'N:1' }
},
{
  id: 'many-to-many',
  group: 'Relationships',
  title: 'Many-to-Many',
  oneLiner: 'Not directly representable — it must be resolved into a third table.',
  body: [
  'A student takes many courses and a course holds many students. No single foreign key can express that, so a third table stores one row per pairing.',
  'This is why real schemas contain tables that do not correspond to anything a user would name — they exist to carry a relationship.'],

  visual: { kind: 'junction', left: 'Student', middle: 'Enrollment', right: 'Course' }
},
{
  id: 'junction-table',
  group: 'Advanced',
  title: 'Junction Tables',
  oneLiner: 'An associative entity carrying foreign keys to both sides.',
  body: [
  'A junction table has a foreign key to each participant, usually combined into its composite primary key so a pairing cannot be duplicated.',
  'It frequently earns its own attributes — a grade, a quantity, an enrolled date. Once it does, it stops being plumbing and becomes an entity in its own right.'],

  sql: `CREATE TABLE Enrollment (
    student_id INT,
    course_id INT,
    grade CHAR(2),
    PRIMARY KEY (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES Student(student_id),
    FOREIGN KEY (course_id) REFERENCES Course(course_id)
);`,
  quiz: {
    question: 'How does SCHEMA BUREAU infer that a table is a junction table?',
    options: [
    'Two or more foreign keys are covered by its composite primary key or a unique constraint',
    'Its name ends in "Link" or "Map"',
    'It has fewer than four columns'],

    answer: 0,
    explanation:
    'The inference is structural, never name-based — which is why it works on schemas SCHEMA BUREAU has never seen.'
  }
},
{
  id: 'normalization',
  group: 'Advanced',
  title: 'Normalization',
  oneLiner: 'Organising columns so that every fact is stored exactly once.',
  body: [
  '1NF: every attribute holds a single atomic value — no lists inside a column.',
  '2NF: no non-key attribute depends on only part of a composite key. If course_title sits in Enrollment(student_id, course_id), it depends on course_id alone and belongs in Course.',
  '3NF: no non-key attribute depends on another non-key attribute. If Student stores department_name alongside department_id, the name is transitively dependent and belongs in Department.',
  'Denormalization is the deliberate reversal of this for read performance. It is a trade, not a mistake — but make it knowingly.'],

  visual: {
    kind: 'layers',
    layers: [
    { title: '1NF', detail: 'Atomic values, no repeating groups' },
    { title: '2NF', detail: 'No partial dependency on a composite key' },
    { title: '3NF', detail: 'No transitive dependency between non-key attributes' }]

  }
},
{
  id: 'logical-physical',
  group: 'Advanced',
  title: 'Logical vs Physical Schema',
  oneLiner: 'What the data means versus how the engine stores it.',
  body: [
  'The logical schema is entities, attributes and relationships — engine-independent. The physical schema is tables, indexes, storage engines, partitions and types with specific widths.',
  'An ER diagram is a logical artefact derived from a physical definition. That is exactly the direction SCHEMA BUREAU works in: it reads your physical DDL and reconstructs the logical model it implies.'],

  visual: {
    kind: 'layers',
    layers: [
    { title: 'Conceptual', detail: 'Entities and relationships in business language' },
    { title: 'Logical', detail: 'Attributes, keys, cardinality — no engine specifics' },
    { title: 'Physical', detail: 'DDL, data types, indexes, storage' }]

  }
},
{
  id: 'self-reference',
  group: 'Relationships',
  title: 'Self-Referencing Relationships',
  oneLiner: 'A table whose foreign key points back at itself.',
  body: [
  'Hierarchies live in one table: each employee stores the id of their manager, who is another employee. The foreign key must be nullable, otherwise no row could ever be inserted first.',
  'Querying these requires recursion (WITH RECURSIVE) rather than a fixed number of joins.'],

  sql: `CREATE TABLE Employee (
    employee_id INT PRIMARY KEY,
    manager_id INT,
    FOREIGN KEY (manager_id) REFERENCES Employee(employee_id)
);`,
  visual: { kind: 'hierarchy', left: 'Employee' }
}];


export const LEARN_GROUPS: LearnTopic['group'][] = ['Foundations', 'Keys', 'Relationships', 'Advanced'];