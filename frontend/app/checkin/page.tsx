'use client';

import { useEffect, useState } from 'react';
import {
  Group,
  Title,
  Text,
  Button,
  Table,
  Paper,
  Modal,
  Select,
  Textarea,
  Switch,
  Alert,
  ActionIcon,
  notifications,
  Badge,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconArrowRight,
  IconArrowLeft,
  IconAlertTriangle,
  IconPhoneCall,
} from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Location, Person, CheckInRecord, CheckInStatus } from '@/types';

export default function CheckInPage() {
  const [records, setRecords] = useState<CheckInRecord[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);
  const [checkOutModalOpen, setCheckOutModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<CheckInRecord | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>(CheckInStatus.CHECKED_IN);

  const checkInForm = useForm({
    initialValues: {
      personId: '',
      locationId: '',
      notes: '',
    },
  });

  const checkOutForm = useForm({
    initialValues: {
      confirmed: true,
      notes: '',
    },
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  async function loadData() {
    try {
      const params = filterStatus ? { status: filterStatus } : {};
      const [recordsData, locationsData, peopleData] = await Promise.all([
        api.checkIns.getAll(params),
        api.locations.getAll({ status: 'open' }),
        api.people.getAll(),
      ]);
      setRecords(recordsData);
      setLocations(locationsData);
      setPeople(peopleData);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  const availablePeople = people.filter((p) => !p.isCurrentlyCheckedIn);
  const availableLocations = locations.filter((l) => l.status === 'open' && l.currentOccupancy < l.capacity);

  async function handleCheckIn(values: any) {
    try {
      await api.checkIns.checkIn(values);
      notifications.show({ title: '成功', message: '进站登记成功', color: 'green' });
      setCheckInModalOpen(false);
      checkInForm.reset();
      loadData();
    } catch (error: any) {
      notifications.show({ title: '登记失败', message: error.message, color: 'red' });
    }
  }

  function openCheckOutModal(record: CheckInRecord) {
    setSelectedRecord(record);
    checkOutForm.reset();
    setCheckOutModalOpen(true);
  }

  async function handleCheckOut(values: any) {
    if (!selectedRecord) return;
    try {
      await api.checkIns.checkOut({
        recordId: selectedRecord.id,
        notes: values.notes,
        confirmed: values.confirmed,
      });
      const message = values.confirmed
        ? '出站登记成功'
        : '出站未确认，已生成回访提醒';
      const color = values.confirmed ? 'green' : 'yellow';
      notifications.show({ title: '成功', message, color });
      setCheckOutModalOpen(false);
      loadData();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleSendReminder(id: string) {
    try {
      await api.checkIns.markReminderSent(id);
      notifications.show({ title: '成功', message: '已标记提醒已发送', color: 'green' });
      loadData();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  const unconfirmedCount = records.filter((r) => r.status === CheckInStatus.LEFT_UNCONFIRMED).length;

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>进站登记</Title>
          <Text size="sm" c="dimmed">社区登记重点人员进站和出站</Text>
        </div>
        <Group>
          <Select
            placeholder="筛选状态"
            value={filterStatus}
            onChange={(value) => setFilterStatus(value || '')}
            data={[
              { value: CheckInStatus.CHECKED_IN, label: '在站人员' },
              { value: CheckInStatus.CHECKED_OUT, label: '已出站' },
              { value: CheckInStatus.LEFT_UNCONFIRMED, label: '离站未确认' },
            ]}
            style={{ width: 160 }}
          />
          <Button
            leftSection={<IconArrowRight size="1rem" />}
            onClick={() => setCheckInModalOpen(true)}
            disabled={availablePeople.length === 0 || availableLocations.length === 0}
          >
            进站登记
          </Button>
        </Group>
      </Group>

      {unconfirmedCount > 0 && (
        <Alert
          icon={<IconAlertTriangle size="1rem" />}
          title="人员离站未确认"
          color="yellow"
          mb="xl"
        >
          有 {unconfirmedCount} 名人员离站时未确认，请及时联系回访，确保人员安全到家。
        </Alert>
      )}

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>人员信息</Table.Th>
              <Table.Th>点位</Table.Th>
              <Table.Th>进站时间</Table.Th>
              <Table.Th>出站时间</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {records.map((record) => (
              <Table.Tr key={record.id}>
                <Table.Td>
                  <Text fw={500}>{record.person?.name}</Text>
                  <Text size="xs" c="dimmed">{record.person?.phone}</Text>
                  <Badge size="xs" mt={4} color={record.person?.priority === 'high' ? 'red' : 'blue'}>
                    {record.person?.priority === 'high' ? '重点关注' : '普通'}
                  </Badge>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{record.location?.name}</Text>
                  <Text size="xs" c="dimmed">{record.location?.address}</Text>
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{new Date(record.checkInTime).toLocaleString('zh-CN')}</Text>
                </Table.Td>
                <Table.Td>
                  {record.checkOutTime ? (
                    <Text size="sm">{new Date(record.checkOutTime).toLocaleString('zh-CN')}</Text>
                  ) : (
                    <Text size="sm" c="dimmed">-</Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={record.status} />
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    {record.status === CheckInStatus.CHECKED_IN && (
                      <Button
                        size="xs"
                        variant="light"
                        color="red"
                        leftSection={<IconArrowLeft size="0.8rem" />}
                        onClick={() => openCheckOutModal(record)}
                      >
                        出站
                      </Button>
                    )}
                    {record.status === CheckInStatus.LEFT_UNCONFIRMED && !record.followUpReminderSent && (
                      <ActionIcon color="yellow" onClick={() => handleSendReminder(record.id)}>
                        <IconPhoneCall size="1rem" />
                      </ActionIcon>
                    )}
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={checkInModalOpen}
        onClose={() => setCheckInModalOpen(false)}
        title="进站登记"
        size="lg"
      >
        <form onSubmit={checkInForm.onSubmit(handleCheckIn)}>
          <Select
            label="选择人员"
            placeholder="请选择要进站的人员"
            data={availablePeople.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.phone})`,
            }))}
            {...checkInForm.getInputProps('personId')}
            mb="md"
            required
            searchable
          />
          <Select
            label="选择点位"
            placeholder="请选择安置点位"
            data={availableLocations.map((l) => ({
              value: l.id,
              label: `${l.name} (${l.currentOccupancy}/${l.capacity})`,
            }))}
            {...checkInForm.getInputProps('locationId')}
            mb="md"
            required
            searchable
          />
          <Textarea
            label="备注"
            placeholder="特殊情况说明"
            {...checkInForm.getInputProps('notes')}
            mb="md"
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setCheckInModalOpen(false)}>取消</Button>
            <Button type="submit">确认进站</Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={checkOutModalOpen}
        onClose={() => setCheckOutModalOpen(false)}
        title="出站登记"
        size="lg"
      >
        <form onSubmit={checkOutForm.onSubmit(handleCheckOut)}>
          <Alert color="blue" mb="md">
            <Text size="sm">
              人员: <strong>{selectedRecord?.person?.name}</strong>
            </Text>
            <Text size="sm">
              进站时间: {selectedRecord && new Date(selectedRecord.checkInTime).toLocaleString('zh-CN')}
            </Text>
          </Alert>
          <Group justify="space-between" mb="md">
            <Text size="sm">已确认安全到家</Text>
            <Switch
              {...checkOutForm.getInputProps('confirmed')}
              labelPosition="left"
            />
          </Group>
          {!checkOutForm.values.confirmed && (
            <Alert color="yellow" mb="md" icon={<IconAlertTriangle size="1rem" />}>
              未确认人员安全到家，系统将自动生成回访提醒任务
            </Alert>
          )}
          <Textarea
            label="备注"
            placeholder="出站情况说明"
            {...checkOutForm.getInputProps('notes')}
            mb="md"
          />
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setCheckOutModalOpen(false)}>取消</Button>
            <Button type="submit" color={checkOutForm.values.confirmed ? 'green' : 'yellow'}>
              {checkOutForm.values.confirmed ? '确认出站' : '未确认出站'}
            </Button>
          </Group>
        </form>
      </Modal>
    </div>
  );
}
