import { adminSeatsApi } from '@/api/admin/seats'
import { eventsApi } from '@/api/events'
import { ConfirmModal } from '@/components/ConfirmModal'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useAuthStore } from '@/stores/authStore'
import { getRoleFromToken } from '@/utils/auth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  Plus,
  Grid3x3,
  Trash2,
  Edit,
  Save,
  X,
  Upload,
  Activity,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Seat } from '@/types/seat'
import type { SeatGrade } from '@/types/admin/seat'

export default function AdminSeatManagementPage() {
  const { eventId } = useParams({ from: '/admin/seats/$eventId' })
  const { isAuthenticated, accessToken } = useAuthStore()
  const queryClient = useQueryClient()

  const userRole = getRoleFromToken(accessToken)
  const isAdmin = userRole === 'ADMIN'

  const hasAuth = isAuthenticated || !!accessToken

  const [editingSeat, setEditingSeat] = useState<number | null>(null)
  const [showBulkCreate, setShowBulkCreate] = useState(false)
  const [showAutoCreate, setShowAutoCreate] = useState(false)
  const [showSingleCreate, setShowSingleCreate] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleteAllModalOpen, setIsDeleteAllModalOpen] = useState(false)
  const [selectedSeatId, setSelectedSeatId] = useState<number | null>(null)

  const [bulkSeats, setBulkSeats] = useState('')

  // Auto create form
  const [autoRows, setAutoRows] = useState(10)
  const [autoCols, setAutoCols] = useState(20)
  const [autoGrade, setAutoGrade] = useState<SeatGrade>('A')
  const [autoPrice, setAutoPrice] = useState(100000)

  // Single create form
  const [singleSeatCode, setSingleSeatCode] = useState('')
  const [singleGrade, setSingleGrade] = useState<SeatGrade>('A')
  const [singlePrice, setSinglePrice] = useState(100000)

  // Edit form
  const [editSeatCode, setEditSeatCode] = useState('')
  const [editGrade, setEditGrade] = useState<SeatGrade>('A')
  const [editPrice, setEditPrice] = useState(0)
  const [editStatus, setEditStatus] = useState<'AVAILABLE' | 'SOLD' | 'RESERVED'>('AVAILABLE')

  const { data: eventData, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => eventsApi.getEventById(eventId),
    enabled: hasAuth && isAdmin,
    retry: false,
    throwOnError: false,
  })

  const { data: seatsData, isLoading } = useQuery({
    queryKey: ['admin', 'seats', eventId],
    queryFn: () => adminSeatsApi.getSeatsByEvent(eventId),
    enabled: hasAuth && isAdmin,
  })

  const seats = seatsData?.data || []
  const eventTitle = eventData?.data?.title || `이벤트 ID: ${eventId}`

  const bulkCreateMutation = useMutation({
    mutationFn: (seats: Array<{ seatCode: string; grade: SeatGrade; price: number }>) =>
      adminSeatsApi.bulkCreateSeats(Number(eventId), { seats }),
    onSuccess: () => {
      toast.success('좌석이 대량 생성되었습니다')
      setBulkSeats('')
      setShowBulkCreate(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'seats', eventId] })
    },
    onError: (error: Error) => {
      toast.error('좌석 생성 실패', {
        description: error.message || 'CSV 형식을 확인해주세요',
      })
    },
  })

  const autoCreateMutation = useMutation({
    mutationFn: () =>
      adminSeatsApi.autoCreateSeats(Number(eventId), {
        rows: autoRows,
        cols: autoCols,
        defaultGrade: autoGrade,
        defaultPrice: autoPrice,
      }),
    onSuccess: () => {
      const totalSeats = autoRows * autoCols
      toast.success(`${totalSeats}개의 좌석이 자동 생성되었습니다`)
      setShowAutoCreate(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'seats', eventId] })
    },
    onError: (error: Error) => {
      toast.error('좌석 생성 실패', {
        description: error.message,
      })
    },
  })

  const singleCreateMutation = useMutation({
    mutationFn: () =>
      adminSeatsApi.createSingleSeat(Number(eventId), {
        seatCode: singleSeatCode,
        grade: singleGrade,
        price: singlePrice,
      }),
    onSuccess: () => {
      toast.success('좌석이 생성되었습니다')
      setShowSingleCreate(false)
      setSingleSeatCode('')
      queryClient.invalidateQueries({ queryKey: ['admin', 'seats', eventId] })
    },
    onError: (error: Error) => {
      toast.error('좌석 생성 실패', {
        description: error.message,
      })
    },
  })

  const updateSeatMutation = useMutation({
    mutationFn: (seatId: number) =>
      adminSeatsApi.updateSeat(Number(eventId), seatId, {
        seatCode: editSeatCode,
        grade: editGrade,
        price: editPrice,
        seatStatus: editStatus,
      }),
    onSuccess: () => {
      toast.success('좌석 정보가 수정되었습니다')
      setEditingSeat(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'seats', eventId] })
    },
    onError: (error: Error) => {
      toast.error('좌석 수정 실패', {
        description: error.message,
      })
    },
  })

  const deleteSeatMutation = useMutation({
    mutationFn: (seatId: number) => adminSeatsApi.deleteSeat(Number(eventId), seatId),
    onSuccess: () => {
      toast.success('좌석이 삭제되었습니다')
      setIsDeleteModalOpen(false)
      setSelectedSeatId(null)
      queryClient.invalidateQueries({ queryKey: ['admin', 'seats', eventId] })
    },
    onError: (error: Error) => {
      toast.error('좌석 삭제 실패', {
        description: error.message,
      })
    },
  })

  const deleteAllSeatsMutation = useMutation({
    mutationFn: () => adminSeatsApi.deleteAllEventSeats(Number(eventId)),
    onSuccess: () => {
      toast.success('모든 좌석이 삭제되었습니다')
      setIsDeleteAllModalOpen(false)
      queryClient.invalidateQueries({ queryKey: ['admin', 'seats', eventId] })
    },
    onError: (error: Error) => {
      toast.error('좌석 삭제 실패', {
        description: error.message,
      })
    },
  })

  const handleBulkCreate = () => {
    try {
      const lines = bulkSeats.trim().split('\n').filter((line) => line.trim())
      const newSeats = lines.map((line) => {
        const parts = line.split(',').map((p) => p.trim())
        if (parts.length < 3) {
          throw new Error('CSV 형식이 올바르지 않습니다: seatCode,grade,price 형식으로 입력해주세요')
        }
        const [seatCode, grade, priceStr] = parts
        const price = Number.parseInt(priceStr, 10)
        if (isNaN(price)) {
          throw new Error('가격은 숫자여야 합니다')
        }
        if (!['VIP', 'R', 'S', 'A', 'B', 'C'].includes(grade)) {
          throw new Error('등급은 VIP, R, S, A, B, C 중 하나여야 합니다')
        }
        return {
          seatCode,
          grade: grade as SeatGrade,
          price,
        }
      })

      bulkCreateMutation.mutate(newSeats)
    } catch (error) {
      toast.error('좌석 생성 실패', {
        description: error instanceof Error ? error.message : 'CSV 형식을 확인해주세요',
      })
    }
  }

  const handleAutoCreate = () => {
    autoCreateMutation.mutate()
  }

  const handleSingleCreate = () => {
    if (!singleSeatCode.trim()) {
      toast.error('좌석 코드를 입력해주세요')
      return
    }
    singleCreateMutation.mutate()
  }

  const handleEditSeat = (seat: Seat) => {
    setEditingSeat(seat.id)
    setEditSeatCode(seat.seatCode)
    setEditGrade(seat.grade as SeatGrade)
    setEditPrice(seat.price)
    setEditStatus(seat.seatStatus)
  }

  const handleUpdateSeat = () => {
    if (!editingSeat) return
    updateSeatMutation.mutate(editingSeat)
  }

  const handleDeleteSeat = (seatId: number) => {
    setSelectedSeatId(seatId)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteAllSeats = () => {
    setIsDeleteAllModalOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AVAILABLE':
        return <Badge className="bg-green-100 text-green-700 border-green-300">예매 가능</Badge>
      case 'RESERVED':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-300">예약중</Badge>
      case 'SOLD':
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">판매 완료</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 border-gray-300">{status}</Badge>
    }
  }

  if (!hasAuth || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">관리자 권한이 필요합니다.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" size="sm" className="mb-6" asChild>
          <Link to="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            대시보드로 돌아가기
          </Link>
        </Button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">좌석 관리</h1>
            <p className="text-gray-600">
              {eventTitle} - 총 {seats.length}석
            </p>
            {eventError && (
              <p className="text-sm text-orange-600 mt-1">
                이벤트 정보를 불러올 수 없습니다. (에러: {eventError.message})
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowSingleCreate(!showSingleCreate)}>
              <Plus className="w-4 h-4 mr-2" />
              단일 좌석 추가
            </Button>
            <Button variant="outline" onClick={() => setShowAutoCreate(!showAutoCreate)}>
              <Grid3x3 className="w-4 h-4 mr-2" />
              자동 생성
            </Button>
            <Button variant="outline" onClick={() => setShowBulkCreate(!showBulkCreate)}>
              <Upload className="w-4 h-4 mr-2" />
              대량 생성
            </Button>
            <Button variant="outline" onClick={handleDeleteAllSeats}>
              <Trash2 className="w-4 h-4 mr-2" />
              모두 삭제
            </Button>
          </div>
        </div>

        {showSingleCreate && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">단일 좌석 생성</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <Label>좌석 코드</Label>
                <Input
                  value={singleSeatCode}
                  onChange={(e) => setSingleSeatCode(e.target.value)}
                  placeholder="예: VIP-A-1, R석-B-5"
                />
              </div>
              <div>
                <Label>등급</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={singleGrade}
                  onChange={(e) => setSingleGrade(e.target.value as SeatGrade)}
                >
                  <option value="VIP">VIP</option>
                  <option value="R">R석</option>
                  <option value="S">S석</option>
                  <option value="A">A석</option>
                  <option value="B">B석</option>
                  <option value="C">C석</option>
                </select>
              </div>
              <div>
                <Label>가격 (원)</Label>
                <Input
                  type="number"
                  value={singlePrice}
                  onChange={(e) => setSinglePrice(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSingleCreate} disabled={singleCreateMutation.isPending}>
                {singleCreateMutation.isPending ? '생성 중...' : '생성'}
              </Button>
              <Button variant="outline" onClick={() => setShowSingleCreate(false)}>
                취소
              </Button>
            </div>
          </Card>
        )}

        {showAutoCreate && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">좌석 자동 생성 (행 × 열)</h3>
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <Label>행 수</Label>
                <Input
                  type="number"
                  value={autoRows}
                  onChange={(e) => setAutoRows(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>열 수 (행당 좌석)</Label>
                <Input
                  type="number"
                  value={autoCols}
                  onChange={(e) => setAutoCols(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>기본 등급</Label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  value={autoGrade}
                  onChange={(e) => setAutoGrade(e.target.value as SeatGrade)}
                >
                  <option value="VIP">VIP</option>
                  <option value="R">R석</option>
                  <option value="S">S석</option>
                  <option value="A">A석</option>
                  <option value="B">B석</option>
                  <option value="C">C석</option>
                </select>
              </div>
              <div>
                <Label>기본 가격 (원)</Label>
                <Input
                  type="number"
                  value={autoPrice}
                  onChange={(e) => setAutoPrice(Number.parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">총 {autoRows * autoCols}개의 좌석이 생성됩니다</p>
            <div className="flex gap-2">
              <Button onClick={handleAutoCreate} disabled={autoCreateMutation.isPending}>
                {autoCreateMutation.isPending ? '생성 중...' : '생성'}
              </Button>
              <Button variant="outline" onClick={() => setShowAutoCreate(false)}>
                취소
              </Button>
            </div>
          </Card>
        )}

        {showBulkCreate && (
          <Card className="p-6 mb-6">
            <h3 className="font-bold mb-4">대량 좌석 생성 (CSV)</h3>
            <p className="text-sm text-gray-600 mb-4">
              CSV 형식으로 입력해주세요: 좌석코드,등급,가격 (한 줄에 하나씩)
              <br />
              예: VIP-A-1,VIP,150000
            </p>
            <textarea
              className="w-full h-32 border border-gray-300 rounded-lg p-3 mb-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={bulkSeats}
              onChange={(e) => setBulkSeats(e.target.value)}
              placeholder="VIP-A-1,VIP,150000&#10;VIP-A-2,VIP,150000&#10;R석-B-1,R,120000"
            />
            <div className="flex gap-2">
              <Button onClick={handleBulkCreate} disabled={bulkCreateMutation.isPending}>
                {bulkCreateMutation.isPending ? '생성 중...' : '생성'}
              </Button>
              <Button variant="outline" onClick={() => setShowBulkCreate(false)}>
                취소
              </Button>
            </div>
          </Card>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-semibold">좌석 코드</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">등급</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">가격</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">상태</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold"> </th>
                </tr>
              </thead>
              <tbody>
                {seats.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      등록된 좌석이 없습니다.
                    </td>
                  </tr>
                ) : (
                  seats.map((seat) => (
                    <tr key={seat.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {editingSeat === seat.id ? (
                          <Input
                            value={editSeatCode}
                            onChange={(e) => setEditSeatCode(e.target.value)}
                            className="w-32"
                          />
                        ) : (
                          seat.seatCode
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingSeat === seat.id ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            value={editGrade}
                            onChange={(e) => setEditGrade(e.target.value as SeatGrade)}
                          >
                            <option value="VIP">VIP</option>
                            <option value="R">R석</option>
                            <option value="S">S석</option>
                            <option value="A">A석</option>
                            <option value="B">B석</option>
                            <option value="C">C석</option>
                          </select>
                        ) : (
                          seat.grade
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingSeat === seat.id ? (
                          <Input
                            type="number"
                            value={editPrice}
                            onChange={(e) => setEditPrice(Number.parseInt(e.target.value) || 0)}
                            className="w-24"
                          />
                        ) : (
                          `${seat.price.toLocaleString()}원`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingSeat === seat.id ? (
                          <select
                            className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                            value={editStatus}
                            onChange={(e) =>
                              setEditStatus(e.target.value as 'AVAILABLE' | 'SOLD' | 'RESERVED')
                            }
                          >
                            <option value="AVAILABLE">예매 가능</option>
                            <option value="RESERVED">예약중</option>
                            <option value="SOLD">판매 완료</option>
                          </select>
                        ) : (
                          getStatusBadge(seat.seatStatus)
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex gap-2 justify-end">
                          {editingSeat === seat.id ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={handleUpdateSeat}
                                disabled={updateSeatMutation.isPending}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingSeat(null)}
                                disabled={updateSeatMutation.isPending}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button size="sm" variant="ghost" onClick={() => handleEditSeat(seat)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteSeat(seat.id)}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <ConfirmModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={() => {
          if (selectedSeatId) {
            deleteSeatMutation.mutate(selectedSeatId)
          }
        }}
        title="좌석 삭제"
        description="이 좌석을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={deleteSeatMutation.isPending}
      />

      <ConfirmModal
        open={isDeleteAllModalOpen}
        onOpenChange={setIsDeleteAllModalOpen}
        onConfirm={() => {
          deleteAllSeatsMutation.mutate()
        }}
        title="모든 좌석 삭제"
        description="이벤트의 모든 좌석을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
        confirmText="삭제"
        cancelText="취소"
        variant="danger"
        isLoading={deleteAllSeatsMutation.isPending}
      />
    </div>
  )
}

