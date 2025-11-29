# MatchTicket Database

This directory contains the SQL scripts for the MatchTicket application database.

## Database Structure

### Tables

#### 1. `matches`
Stores information about football matches.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO_INCREMENT) | Unique identifier |
| home_team | VARCHAR(100) | Home team name |
| away_team | VARCHAR(100) | Away team name |
| date | DATE | Match date |
| venue | VARCHAR(200) | Match venue/stadium |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

**Indexes:**
- `idx_date` - For efficient date-based queries
- `idx_home_team` - For searching by home team
- `idx_away_team` - For searching by away team
- `idx_venue` - For venue-based queries

#### 2. `tickets`
Stores ticket information for events/matches.

| Column | Type | Description |
|--------|------|-------------|
| id | INT (PK, AUTO_INCREMENT) | Unique identifier |
| event | VARCHAR(200) | Event name |
| date | DATE | Event date |
| seat | VARCHAR(20) | Seat number/identifier |
| price | DECIMAL(10,2) | Ticket price |
| status | ENUM | Ticket status: 'available', 'sold', 'reserved' |
| match_id | INT (FK) | Foreign key to matches table (optional) |
| created_at | TIMESTAMP | Record creation timestamp |
| updated_at | TIMESTAMP | Record update timestamp |

**Indexes:**
- `idx_status` - For filtering by ticket status
- `idx_date` - For date-based queries
- `idx_event` - For searching by event name
- `idx_match_id` - For joining with matches table
- `unique_seat_per_event` - Ensures no duplicate seats per event

**Relationships:**
- `match_id` → `matches.id` (ON DELETE SET NULL)

## Setup Instructions

### Option 1: Using MySQL Command Line

```bash
# Connect to MySQL
mysql -u root -p

# Run the schema script
source /home/ameftah/MatchTicket/MatchTicket/database/schema.sql

# Or import directly
mysql -u root -p < /home/ameftah/MatchTicket/MatchTicket/database/schema.sql
```

### Option 2: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your MySQL server
3. File → Open SQL Script
4. Select `schema.sql`
5. Execute the script (⚡ icon or Ctrl+Shift+Enter)

### Option 3: Using Docker

```bash
# Start MySQL container
docker run --name match-ticket-db \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=match_ticket \
  -p 3306:3306 \
  -d mysql:8.0

# Import schema
docker exec -i match-ticket-db mysql -uroot -pyour_password match_ticket < database/schema.sql
```

## Sample Queries

### Get all available tickets
```sql
SELECT * FROM tickets WHERE status = 'available';
```

### Get all matches with available tickets
```sql
SELECT DISTINCT m.* 
FROM matches m
INNER JOIN tickets t ON m.id = t.match_id
WHERE t.status = 'available';
```

### Get ticket statistics by status
```sql
SELECT status, COUNT(*) as count, SUM(price) as total_value
FROM tickets
GROUP BY status;
```

### Get upcoming matches
```sql
SELECT * FROM matches
WHERE date >= CURDATE()
ORDER BY date ASC;
```

### Get tickets for a specific match
```sql
SELECT t.* 
FROM tickets t
INNER JOIN matches m ON t.match_id = m.id
WHERE m.home_team = 'Real Madrid' AND m.away_team = 'Liverpool';
```

## Connection Configuration

For your Angular application backend, use these connection parameters:

```javascript
const dbConfig = {
  host: 'localhost',
  port: 3306,
  user: 'your_username',
  password: 'your_password',
  database: 'match_ticket'
};
```

## Notes

- The database uses UTF-8 (utf8mb4) encoding for proper international character support
- Timestamps are automatically maintained for created_at and updated_at fields
- Foreign key constraints ensure referential integrity
- Indexes are added for optimal query performance
- The unique constraint on (event, seat) prevents double-booking of seats
