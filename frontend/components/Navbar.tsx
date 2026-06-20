'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavLink, NavLinkProps, Text } from '@mantine/core';
import {
  IconHome,
  IconMapPin,
  IconUsers,
  IconClipboardCheck,
  IconPackage,
  IconTruck,
  IconPhoneCall,
  IconFileInvoice,
} from '@tabler/icons-react';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  color?: NavLinkProps['color'];
}

const navItems: NavItem[] = [
  {
    label: '仪表盘',
    href: '/',
    icon: <IconHome size="1.2rem" />,
    color: 'blue',
  },
  {
    label: '点位管理',
    href: '/locations',
    icon: <IconMapPin size="1.2rem" />,
    color: 'green',
  },
  {
    label: '重点人群',
    href: '/people',
    icon: <IconUsers size="1.2rem" />,
    color: 'red',
  },
  {
    label: '进站登记',
    href: '/checkin',
    icon: <IconClipboardCheck size="1.2rem" />,
    color: 'violet',
  },
  {
    label: '物资管理',
    href: '/materials',
    icon: <IconPackage size="1.2rem" />,
    color: 'orange',
  },
  {
    label: '物资调拨',
    href: '/allocations',
    icon: <IconTruck size="1.2rem" />,
    color: 'cyan',
  },
  {
    label: '回访提醒',
    href: '/followups',
    icon: <IconPhoneCall size="1.2rem" />,
    color: 'pink',
  },
  {
    label: '补货单',
    href: '/replenishments',
    icon: <IconFileInvoice size="1.2rem" />,
    color: 'yellow',
  },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <div>
      <Text size="xs" fw={500} c="dimmed" mb="xs" ml="md">
        功能导航
      </Text>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
          <NavLink
            active={pathname === item.href}
            leftSection={item.icon}
            label={item.label}
            color={item.color}
            variant="light"
            mb={4}
          />
        </Link>
      ))}
    </div>
  );
}
