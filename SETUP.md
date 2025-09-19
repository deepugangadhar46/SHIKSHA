# SHIKSHA - Setup Instructions

## Database Setup (Aiven MySQL)

### 1. Create Aiven MySQL Database

1. Go to [Aiven Console](https://console.aiven.io/)
2. Create a new MySQL service
3. Note down your connection details:
   - Host
   - Port (usually 3306)
   - Username
   - Password
   - Database name

### 2. Run Database Schema

1. Connect to your Aiven MySQL database using your preferred MySQL client
2. Run the SQL script from `db/schema.sql` to create all required tables
3. The script includes sample data for testing

### 3. Environment Configuration

1. Copy `env.example` to `.env.local`
2. Fill in your Aiven MySQL credentials:

```env
AIVEN_MYSQL_HOST=your-mysql-host.aivencloud.com
AIVEN_MYSQL_PORT=3306
AIVEN_MYSQL_USER=your-username
AIVEN_MYSQL_PASSWORD=your-password
AIVEN_MYSQL_DATABASE=your-database-name
```

## Application Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test the Application

1. Open http://localhost:3000
2. Try logging in with demo accounts:
   - **Teacher**: teacher@shiksha.edu / teacher123
   - **Student**: student@shiksha.edu / student123

## Architecture Overview

### Storage Strategy

The application uses a **hybrid storage approach**:

1. **Primary Storage**: Aiven MySQL (Cloud)
   - User authentication and profiles
   - Game statistics and progress
   - Analytics data
   - Real-time quiz monitoring

2. **Backup Storage**: IndexedDB (Local)
   - Offline functionality
   - Automatic fallback when cloud is unavailable
   - Sync when connection is restored

### Key Components

#### Authentication Flow
- `lib/storage-adapter.ts` - Handles cloud-first, IndexedDB-fallback logic
- `contexts/auth-context.tsx` - React context using storage adapter
- `app/api/auth/*` - Next.js API routes for cloud authentication

#### Database Layer
- `lib/server/db.ts` - MySQL connection and query methods
- `lib/db/indexed-db.ts` - IndexedDB schema and operations (unchanged)
- `lib/db/offline-db-manager.ts` - Offline sync manager (unchanged)

#### Analytics Dashboard
- `components/teacher/teacher-dashboard.tsx` - Enhanced with new analytics components
- `app/api/analytics/*` - API endpoints for analytics data

### New Features Added

#### Teacher Analytics Dashboard
1. **Student Performance Matrix** - Grid view with color-coded performance
2. **Real-Time Quiz Monitor** - Live quiz attempts and completions
3. **Concept Breakdown** - Subject-wise topic analysis
4. **Student Profile Cards** - Individual student details with charts
5. **Actionable Insights** - AI-generated recommendations

#### Real-time Features
- WebSocket support for live quiz monitoring
- Auto-refresh capabilities
- Connection status indicators

## Testing

### Demo Data
The database schema includes demo accounts and sample data for testing.

### Offline Testing
1. Start the app and log in
2. Disconnect from internet
3. The app should continue working with IndexedDB
4. Reconnect - data will sync back to cloud

## Deployment

### Environment Variables for Production
```env
AIVEN_MYSQL_HOST=your-production-host
AIVEN_MYSQL_PORT=3306
AIVEN_MYSQL_USER=your-production-user
AIVEN_MYSQL_PASSWORD=your-production-password
AIVEN_MYSQL_DATABASE=your-production-database
NEXTAUTH_SECRET=your-secure-secret-key
NEXTAUTH_URL=https://your-domain.com
```

### Build and Deploy
```bash
npm run build
npm start
```

## Troubleshooting

### Database Connection Issues
1. Check your Aiven MySQL credentials
2. Ensure your IP is whitelisted in Aiven console
3. Verify SSL connection is working

### IndexedDB Fallback
If you see "IndexedDB API missing" errors:
1. Check browser compatibility
2. Ensure the app is running in a browser environment
3. The error should only appear during SSR (server-side rendering)

### Real-time Features
For WebSocket functionality:
1. Set `NEXT_PUBLIC_WS_URL` in your environment
2. Implement WebSocket server for production use
3. Current implementation uses mock data for demonstration

## Development Notes

### Adding New Analytics
1. Create API endpoint in `app/api/analytics/`
2. Add corresponding component in teacher dashboard
3. Update storage adapter if needed

### Database Schema Changes
1. Update `db/schema.sql`
2. Update TypeScript interfaces in `lib/server/db.ts`
3. Run migration on your Aiven database

### Offline Sync
The offline manager automatically handles:
- Data queuing when offline
- Sync when connection restored
- Conflict resolution (last-write-wins)
