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
  TextInput,
  Textarea,
  Select,
  ActionIcon,
  Alert,
  Switch,
  Divider,
  Stack,
  Badge,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import {
  IconPlus,
  IconEdit,
  IconTrash,
  IconUser,
  IconPhone,
  IconEye,
  IconPhoneCall,
  IconAlertTriangle,
  IconCheck,
  IconX,
  IconHistory,
} from '@tabler/icons-react';
import { api } from '@/lib/api';
import { StatusBadge } from '@/components/StatusBadge';
import { Person, PersonPriority, FollowUp, FollowUpStatus, CheckInStatus, ContactResult } from '@/types';

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('');

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [editingFollowUp, setEditingFollowUp] = useState<FollowUp | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      idCard: '',
      phone: '',
      address: '',
      community: '',
      priority: PersonPriority.MEDIUM,
      medicalConditions: '',
      emergencyContact: '',
      emergencyPhone: '',
    },
  });

  const followUpForm = useForm({
    initialValues: {
      status: FollowUpStatus.PENDING,
      contactResult: '' as ContactResult | '',
      departureRemarks: '',
      notes: '',
      needsFurtherAction: false,
    },
  });

  useEffect(() => {
    loadPeople();
  }, [filterPriority]);

  async function loadPeople() {
    try {
      const params = filterPriority ? { priority: filterPriority } : {};
      const data = await api.people.getAll(params);
      setPeople(data);
    } catch (error: any) {
      notifications.show({ title: '加载失败', message: error.message, color: 'red' });
    } finally {
      setLoading(false);
    }
  }

  async function loadPersonDetail(id: string) {
    setDetailLoading(true);
    try {
      const data = await api.people.get(id);
      setSelectedPerson(data);
    } catch (error: any) {
      notifications.show({ title: '加载详情失败', message: error.message, color: 'red' });
    } finally {
      setDetailLoading(false);
    }
  }

  function openCreateModal() {
    setEditingPerson(null);
    form.reset();
    setModalOpen(true);
  }

  function openEditModal(person: Person) {
    setEditingPerson(person);
    form.setValues({
      name: person.name,
      idCard: person.idCard,
      phone: person.phone,
      address: person.address,
      community: person.community,
      priority: person.priority,
      medicalConditions: person.medicalConditions || '',
      emergencyContact: person.emergencyContact || '',
      emergencyPhone: person.emergencyPhone || '',
    });
    setModalOpen(true);
  }

  async function openDetailModal(person: Person) {
    setDetailModalOpen(true);
    await loadPersonDetail(person.id);
  }

  function openFollowUpModal(followUp: FollowUp) {
    setEditingFollowUp(followUp);
    followUpForm.setValues({
      status: followUp.status,
      contactResult: followUp.contactResult || '',
      departureRemarks: followUp.departureRemarks || '',
      notes: followUp.notes || '',
      needsFurtherAction: followUp.needsFurtherAction,
    });
    setFollowUpModalOpen(true);
  }

  async function handleSubmit(values: any) {
    try {
      if (editingPerson) {
        await api.people.update(editingPerson.id, values);
        notifications.show({ title: '成功', message: '人员信息已更新', color: 'green' });
      } else {
        await api.people.create(values);
        notifications.show({ title: '成功', message: '人员已添加', color: 'green' });
      }
      setModalOpen(false);
      loadPeople();
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('确定要删除该人员信息吗？')) return;
    try {
      await api.people.delete(id);
      notifications.show({ title: '成功', message: '人员已删除', color: 'green' });
      loadPeople();
    } catch (error: any) {
      notifications.show({ title: '删除失败', message: error.message, color: 'red' });
    }
  }

  async function handleFollowUpSubmit(values: any) {
    if (!editingFollowUp) return;
    try {
      const submitData: any = {
        status: values.status,
        notes: values.notes,
        needsFurtherAction: values.needsFurtherAction,
      };
      if (values.contactResult) {
        submitData.contactResult = values.contactResult;
      }
      if (values.departureRemarks) {
        submitData.departureRemarks = values.departureRemarks;
      }
      await api.followUps.update(editingFollowUp.id, submitData);
      notifications.show({ title: '成功', message: '回访记录已更新', color: 'green' });
      setFollowUpModalOpen(false);
      if (selectedPerson) {
        await loadPersonDetail(selectedPerson.id);
      }
    } catch (error: any) {
      notifications.show({ title: '操作失败', message: error.message, color: 'red' });
    }
  }

  function hasUnconfirmedDeparture(person: Person): boolean {
    if (!person.checkInRecords) return false;
    return person.checkInRecords.some((r) => r.status === CheckInStatus.LEFT_UNCONFIRMED);
  }

  function hasPendingDepartureFollowUp(person: Person): FollowUp | undefined {
    if (!person.followUps) return undefined;
    return person.followUps.find(
      (f) => f.isDepartureFollowUp && f.status === FollowUpStatus.PENDING
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2}>重点人群</Title>
          <Text size="sm" c="dimmed">社区登记和管理重点关注人群</Text>
        </div>
        <Group>
          <Select
            placeholder="筛选优先级"
            clearable
            value={filterPriority}
            onChange={(value) => setFilterPriority(value || '')}
            data={[
              { value: PersonPriority.HIGH, label: '高优先级' },
              { value: PersonPriority.MEDIUM, label: '中优先级' },
              { value: PersonPriority.LOW, label: '低优先级' },
            ]}
            style={{ width: 140 }}
          />
          <Button leftSection={<IconPlus size="1rem" />} onClick={openCreateModal}>
            新增人员
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md">
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>姓名</Table.Th>
              <Table.Th>联系方式</Table.Th>
              <Table.Th>社区/地址</Table.Th>
              <Table.Th>优先级</Table.Th>
              <Table.Th>健康状况</Table.Th>
              <Table.Th>状态</Table.Th>
              <Table.Th>操作</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {people.map((person) => (
              <Table.Tr key={person.id}>
                <Table.Td>
                  <Group>
                    <IconUser size="1rem" color="#1677ff" />
                    <Text fw={500}>{person.name}</Text>
                  </Group>
                  <Text size="xs" c="dimmed">身份证: {person.idCard}</Text>
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <IconPhone size="0.8rem" color="green" />
                    <Text size="sm">{person.phone}</Text>
                  </Group>
                  {person.emergencyContact && (
                    <Text size="xs" c="dimmed">
                      紧急联系人: {person.emergencyContact} ({person.emergencyPhone})
                    </Text>
                  )}
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{person.community}</Text>
                  <Text size="xs" c="dimmed">{person.address}</Text>
                </Table.Td>
                <Table.Td>
                  <StatusBadge status={person.priority} />
                </Table.Td>
                <Table.Td>
                  <Text size="sm">{person.medicalConditions || '无特殊情况'}</Text>
                </Table.Td>
                <Table.Td>
                  {person.isCurrentlyCheckedIn ? (
                    <StatusBadge status="checked_in" />
                  ) : (
                    <StatusBadge status="checked_out" />
                  )}
                </Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon variant="subtle" color="cyan" onClick={() => openDetailModal(person)}>
                      <IconEye size="1rem" />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="blue" onClick={() => openEditModal(person)}>
                      <IconEdit size="1rem" />
                    </ActionIcon>
                    <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(person.id)}>
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>

      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPerson ? '编辑人员' : '新增人员'}
        size="lg"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Group grow mb="md">
            <TextInput
              label="姓名"
              placeholder="请输入姓名"
              {...form.getInputProps('name')}
              required
            />
            <TextInput
              label="身份证号"
              placeholder="请输入身份证号"
              {...form.getInputProps('idCard')}
              required
            />
          </Group>
          <Group grow mb="md">
            <TextInput
              label="联系电话"
              placeholder="请输入联系电话"
              {...form.getInputProps('phone')}
              required
            />
            <Select
              label="优先级"
              data={[
                { value: PersonPriority.HIGH, label: '高优先级（独居老人/慢性病患者）' },
                { value: PersonPriority.MEDIUM, label: '中优先级（普通老人/孕妇）' },
                { value: PersonPriority.LOW, label: '低优先级（普通居民）' },
              ]}
              {...form.getInputProps('priority')}
              required
            />
          </Group>
          <Group grow mb="md">
            <TextInput
              label="所属社区"
              placeholder="请输入社区名称"
              {...form.getInputProps('community')}
              required
            />
            <TextInput
              label="详细地址"
              placeholder="请输入详细地址"
              {...form.getInputProps('address')}
              required
            />
          </Group>
          <Textarea
            label="健康状况/慢性病"
            placeholder="高血压、糖尿病等需要特别关注的情况"
            {...form.getInputProps('medicalConditions')}
            mb="md"
          />
          <Group grow mb="md">
            <TextInput
              label="紧急联系人"
              placeholder="请输入紧急联系人姓名"
              {...form.getInputProps('emergencyContact')}
            />
            <TextInput
              label="紧急联系电话"
              placeholder="请输入紧急联系电话"
              {...form.getInputProps('emergencyPhone')}
            />
          </Group>
          <Group justify="flex-end" mt="xl">
            <Button variant="subtle" onClick={() => setModalOpen(false)}>取消</Button>
            <Button type="submit">{editingPerson ? '保存修改' : '添加人员'}</Button>
          </Group>
        </form>
      </Modal>

      <Modal
        opened={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="人员详情"
        size="xl"
      >
        {selectedPerson && !detailLoading && (
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <IconUser size="1.5rem" color="#1677ff" />
                <div>
                  <Text fw={700} size="lg">{selectedPerson.name}</Text>
                  <Group gap="xs">
                    <StatusBadge status={selectedPerson.priority} />
                    {selectedPerson.isCurrentlyCheckedIn ? (
                      <StatusBadge status="checked_in" />
                    ) : (
                      <StatusBadge status="checked_out" />
                    )}
                  </Group>
                </div>
              </Group>
            </Group>

            <Paper withBorder p="md" radius="md">
              <Group grow>
                <div>
                  <Text size="xs" c="dimmed">身份证号</Text>
                  <Text size="sm">{selectedPerson.idCard}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">联系电话</Text>
                  <Text size="sm">{selectedPerson.phone}</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">社区</Text>
                  <Text size="sm">{selectedPerson.community}</Text>
                </div>
              </Group>
              <Group grow mt="md">
                <div>
                  <Text size="xs" c="dimmed">详细地址</Text>
                  <Text size="sm">{selectedPerson.address}</Text>
                </div>
              </Group>
              <Group grow mt="md">
                <div>
                  <Text size="xs" c="dimmed">健康状况</Text>
                  <Text size="sm">{selectedPerson.medicalConditions || '无特殊情况'}</Text>
                </div>
              </Group>
              {(selectedPerson.emergencyContact || selectedPerson.emergencyPhone) && (
                <Group grow mt="md">
                  <div>
                    <Text size="xs" c="dimmed">紧急联系人</Text>
                    <Text size="sm">{selectedPerson.emergencyContact || '-'}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">紧急联系电话</Text>
                    <Text size="sm">{selectedPerson.emergencyPhone || '-'}</Text>
                  </div>
                </Group>
              )}
            </Paper>

            {hasUnconfirmedDeparture(selectedPerson) && (
              <Alert
                icon={<IconAlertTriangle size="1rem" />}
                title="离站未确认提醒"
                color="yellow"
              >
                <Text size="sm">该人员存在离站时未确认安全到家的记录，请及时回访确认。</Text>
              </Alert>
            )}

            {hasPendingDepartureFollowUp(selectedPerson) && (
              <Alert
                icon={<IconPhoneCall size="1rem" />}
                title="待回访任务"
                color="red"
                withCloseButton={false}
              >
                <Group justify="space-between" align="center">
                  <Text size="sm">该人员有离站回访待处理，请尽快联系确认安全</Text>
                  <Button
                    size="xs"
                    color="red"
                    leftSection={<IconPhoneCall size="0.8rem" />}
                    onClick={() => openFollowUpModal(hasPendingDepartureFollowUp(selectedPerson)!)}
                  >
                    处理回访
                  </Button>
                </Group>
              </Alert>
            )}

            <Divider label="进站登记记录" labelPosition="left" />

            <Paper withBorder radius="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>点位</Table.Th>
                    <Table.Th>进站时间</Table.Th>
                    <Table.Th>出站时间</Table.Th>
                    <Table.Th>状态</Table.Th>
                    <Table.Th>备注</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedPerson.checkInRecords && selectedPerson.checkInRecords.length > 0 ? (
                    selectedPerson.checkInRecords.map((record) => (
                      <Table.Tr key={record.id}>
                        <Table.Td>
                          <Text size="sm">{record.location?.name || '-'}</Text>
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
                          <Text size="sm">{record.notes || '-'}</Text>
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={5}>
                        <Text size="sm" c="dimmed" ta="center">暂无登记记录</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>

            <Divider label="回访记录" labelPosition="left" />

            <Paper withBorder radius="md">
              <Table>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>类型</Table.Th>
                    <Table.Th>回访状态</Table.Th>
                    <Table.Th>联系结果</Table.Th>
                    <Table.Th>回访备注</Table.Th>
                    <Table.Th>创建时间</Table.Th>
                    <Table.Th>处理时间</Table.Th>
                    <Table.Th>操作</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {selectedPerson.followUps && selectedPerson.followUps.length > 0 ? (
                    selectedPerson.followUps.map((followUp) => (
                      <Table.Tr key={followUp.id} bg={followUp.needsFurtherAction ? '#fff1f0' : undefined}>
                        <Table.Td>
                          {followUp.isDepartureFollowUp ? (
                            <Badge color="orange" size="xs">离站回访</Badge>
                          ) : (
                            <Badge color="blue" size="xs">常规回访</Badge>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <StatusBadge status={followUp.status} />
                        </Table.Td>
                        <Table.Td>
                          {followUp.contactResult ? (
                            <StatusBadge status={followUp.contactResult} />
                          ) : (
                            <Text size="sm" c="dimmed">-</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" lineClamp={2}>
                            {followUp.departureRemarks || followUp.notes || '-'}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{new Date(followUp.createdAt).toLocaleString('zh-CN')}</Text>
                        </Table.Td>
                        <Table.Td>
                          {followUp.followUpTime ? (
                            <Text size="sm">{new Date(followUp.followUpTime).toLocaleString('zh-CN')}</Text>
                          ) : (
                            <Text size="sm" c="dimmed">-</Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {followUp.status === FollowUpStatus.PENDING && (
                            <Button
                              size="xs"
                              variant="light"
                              color="blue"
                              leftSection={<IconPhoneCall size="0.8rem" />}
                              onClick={() => openFollowUpModal(followUp)}
                            >
                              处理
                            </Button>
                          )}
                          {followUp.status !== FollowUpStatus.PENDING && (
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              onClick={() => openFollowUpModal(followUp)}
                            >
                              <IconEye size="1rem" />
                            </ActionIcon>
                          )}
                        </Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text size="sm" c="dimmed" ta="center">暂无回访记录</Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Paper>
          </Stack>
        )}
        {detailLoading && (
          <Text ta="center" py="xl">加载中...</Text>
        )}
      </Modal>

      <Modal
        opened={followUpModalOpen}
        onClose={() => setFollowUpModalOpen(false)}
        title="处理离站回访"
        size="lg"
      >
        {editingFollowUp && (
          <form onSubmit={followUpForm.onSubmit(handleFollowUpSubmit)}>
            <Alert color="blue" mb="md">
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={500}>
                  回访人员: {editingFollowUp.person?.name || selectedPerson?.name}
                </Text>
                {editingFollowUp.isDepartureFollowUp && (
                  <Badge color="orange" size="xs">离站回访</Badge>
                )}
              </Group>
              <Text size="sm">
                联系电话: <strong>{editingFollowUp.person?.phone || selectedPerson?.phone}</strong>
              </Text>
              {(editingFollowUp.person?.emergencyContact || selectedPerson?.emergencyContact) && (
                <Text size="sm" c="dimmed">
                  紧急联系人: {editingFollowUp.person?.emergencyContact || selectedPerson?.emergencyContact}
                  ({editingFollowUp.person?.emergencyPhone || selectedPerson?.emergencyPhone})
                </Text>
              )}
              {(editingFollowUp.person?.medicalConditions || selectedPerson?.medicalConditions) && (
                <Text size="sm" c="dimmed">
                  健康状况: {editingFollowUp.person?.medicalConditions || selectedPerson?.medicalConditions}
                </Text>
              )}
            </Alert>

            <Select
              label="回访状态"
              data={[
                { value: FollowUpStatus.PENDING, label: '待回访' },
                { value: FollowUpStatus.COMPLETED, label: '已完成' },
                { value: FollowUpStatus.NO_ANSWER, label: '未接听' },
                { value: FollowUpStatus.NEEDS_ASSISTANCE, label: '需要协助' },
              ]}
              {...followUpForm.getInputProps('status')}
              mb="md"
              required
            />

            {editingFollowUp.isDepartureFollowUp && (
              <>
                <Select
                  label="离站联系结果"
                  data={[
                    { value: ContactResult.ARRIVED_SAFE, label: '已确认安全到家' },
                    { value: ContactResult.NOT_ARRIVED, label: '未到家，需进一步跟进' },
                    { value: ContactResult.NO_ANSWER, label: '电话未接听' },
                    { value: ContactResult.WRONG_NUMBER, label: '号码错误' },
                    { value: ContactResult.OTHER, label: '其他情况' },
                  ]}
                  {...followUpForm.getInputProps('contactResult')}
                  mb="md"
                  clearable
                  placeholder="请选择联系结果"
                />
                <Textarea
                  label="离站回访备注"
                  placeholder="请记录回访情况，如：已与本人通话确认安全到家、家人代接、途中转车等"
                  {...followUpForm.getInputProps('departureRemarks')}
                  mb="md"
                  minRows={3}
                />
              </>
            )}

            <Group justify="space-between" mb="md">
              <Text size="sm">需要进一步协助处理</Text>
              <Switch
                {...followUpForm.getInputProps('needsFurtherAction')}
                labelPosition="left"
              />
            </Group>

            <Textarea
              label="回访记录"
              placeholder="请记录回访情况和人员状态"
              {...followUpForm.getInputProps('notes')}
              mb="md"
              minRows={2}
            />

            <Group justify="flex-end" mt="xl">
              <Button variant="subtle" onClick={() => setFollowUpModalOpen(false)}>取消</Button>
              <Button type="submit">保存回访结果</Button>
            </Group>
          </form>
        )}
      </Modal>
    </div>
  );
}
