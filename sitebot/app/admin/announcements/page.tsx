import { getAnnouncements } from '@/app/actions/admin-controls'
import { getAuditLog } from '@/app/actions/admin-analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, History, Megaphone, AlertTriangle, CheckCircle, Info, Wrench } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { AnnouncementsManager } from '@/components/admin/announcements-manager'

export default async function AdminAnnouncementsPage() {
    const [announcements, auditLog] = await Promise.all([
        getAnnouncements().catch(() => []),
        getAuditLog(20).catch(() => [])
    ])

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
            case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'maintenance': return <Wrench className="h-4 w-4 text-orange-500" />
            default: return <Info className="h-4 w-4 text-blue-500" />
        }
    }

    const getTypeBadgeVariant = (type: string) => {
        switch (type) {
            case 'warning': return 'destructive'
            case 'success': return 'default'
            case 'maintenance': return 'secondary'
            default: return 'outline'
        }
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
                    <p className="text-muted-foreground">
                        Manage global announcements and view admin activity log.
                    </p>
                </div>
            </div>

            {/* Announcements Manager Client Component */}
            <AnnouncementsManager initialAnnouncements={announcements} />

            {/* Current Announcements List */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Megaphone className="h-5 w-5 text-purple-500" />
                        <CardTitle>All Announcements</CardTitle>
                        <Badge variant="secondary">{announcements.length}</Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {announcements.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No announcements created yet.</p>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={`flex items-start justify-between p-4 border rounded-lg ${announcement.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getTypeIcon(announcement.type)}
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">{announcement.title}</p>
                                                <Badge variant={getTypeBadgeVariant(announcement.type) as 'default' | 'secondary' | 'destructive' | 'outline'}>
                                                    {announcement.type}
                                                </Badge>
                                                {!announcement.is_active && (
                                                    <Badge variant="outline">Inactive</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {announcement.message}
                                            </p>
                                            <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                                                <span>
                                                    Started: {formatDistanceToNow(new Date(announcement.starts_at), { addSuffix: true })}
                                                </span>
                                                {announcement.ends_at && (
                                                    <span>
                                                        Ends: {formatDistanceToNow(new Date(announcement.ends_at), { addSuffix: true })}
                                                    </span>
                                                )}
                                                {announcement.target_plans.length > 0 && (
                                                    <span>
                                                        Plans: {announcement.target_plans.join(', ')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Admin Audit Log */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-purple-500" />
                        <CardTitle>Recent Admin Activity</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {auditLog.length === 0 ? (
                        <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
                    ) : (
                        <div className="space-y-3">
                            {auditLog.map((entry) => (
                                <div
                                    key={entry.id}
                                    className="flex items-center justify-between py-2 border-b last:border-0"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500 text-xs">
                                            {entry.admin_email?.charAt(0).toUpperCase() || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm">
                                                <span className="font-medium">{entry.admin_email}</span>
                                                {' '}
                                                <span className="text-muted-foreground">{entry.action.replace(/_/g, ' ')}</span>
                                                {entry.target_email && (
                                                    <>
                                                        {' → '}
                                                        <span className="font-medium">{entry.target_email}</span>
                                                    </>
                                                )}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{entry.target_type}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
