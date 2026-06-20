import { Badge, BadgeProps } from '@mantine/core';
import { LocationStatus, PersonPriority, CheckInStatus, MaterialCategory, AllocationStatus, FollowUpStatus, ReplenishmentStatus } from '@/types';

const statusConfig: Record<string, { color: BadgeProps['color']; label: string }> = {
  [LocationStatus.OPEN]: { color: 'green', label: '开放中' },
  [LocationStatus.FULL]: { color: 'yellow', label: '已满员' },
  [LocationStatus.CLOSED]: { color: 'gray', label: '已关闭' },

  [PersonPriority.HIGH]: { color: 'red', label: '高优先级' },
  [PersonPriority.MEDIUM]: { color: 'yellow', label: '中优先级' },
  [PersonPriority.LOW]: { color: 'green', label: '低优先级' },

  [CheckInStatus.CHECKED_IN]: { color: 'blue', label: '在站' },
  [CheckInStatus.CHECKED_OUT]: { color: 'gray', label: '已离站' },
  [CheckInStatus.LEFT_UNCONFIRMED]: { color: 'red', label: '离站未确认' },

  [MaterialCategory.DRINKING_WATER]: { color: 'cyan', label: '饮用水' },
  [MaterialCategory.MEDICINE]: { color: 'red', label: '药品' },
  [MaterialCategory.FOOD]: { color: 'orange', label: '食品' },
  [MaterialCategory.OTHER]: { color: 'gray', label: '其他' },

  [AllocationStatus.PENDING]: { color: 'yellow', label: '待出库' },
  [AllocationStatus.IN_TRANSIT]: { color: 'blue', label: '运输中' },
  [AllocationStatus.DELIVERED]: { color: 'green', label: '已送达' },
  [AllocationStatus.CANCELLED]: { color: 'gray', label: '已取消' },

  [FollowUpStatus.PENDING]: { color: 'yellow', label: '待回访' },
  [FollowUpStatus.COMPLETED]: { color: 'green', label: '已完成' },
  [FollowUpStatus.NO_ANSWER]: { color: 'orange', label: '未接听' },
  [FollowUpStatus.NEEDS_ASSISTANCE]: { color: 'red', label: '需协助' },

  [ReplenishmentStatus.PENDING]: { color: 'yellow', label: '待审批' },
  [ReplenishmentStatus.APPROVED]: { color: 'blue', label: '已批准' },
  [ReplenishmentStatus.ORDERED]: { color: 'violet', label: '已下单' },
  [ReplenishmentStatus.RECEIVED]: { color: 'green', label: '已收货' },
  [ReplenishmentStatus.CANCELLED]: { color: 'gray', label: '已取消' },
};

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] || { color: 'gray', label: status };
  return <Badge color={config.color}>{config.label}</Badge>;
}
