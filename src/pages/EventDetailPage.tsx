import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  Calendar,
  MapPin,
  Users as UsersIcon,
  Clock,
  Shield,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";
import { Link, useParams } from "@tanstack/react-router";

// 임시 데이터 (실제로는 API에서 가져옴)
const getEventById = (id: string) => {
  const events = {
    "1": {
      id: 1,
      title: "2025 콘서트 투어",
      artist: "아티스트 A",
      date: "2025.01.15 (수)",
      time: "19:00",
      location: "서울 올림픽공원 체조경기장",
      address: "서울특별시 송파구 올림픽로 424",
      image: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=600&fit=crop",
      price: "99,000원~",
      status: "예매중" as const,
      registrationDeadline: "2025.01.10",
      registrationStart: "2025.01.01",
      totalSeats: 5000,
      registeredUsers: 3200,
      description:
        "2025년을 여는 특별한 콘서트! 아티스트 A의 새로운 앨범을 기념하여 전국 투어의 첫 무대를 서울에서 진행합니다. 히트곡들과 신곡 무대를 함께 만나보세요.",
      priceOptions: [
        { type: "VIP석", price: "150,000원", benefits: ["포토타임", "사인회", "굿즈"] },
        { type: "R석", price: "99,000원", benefits: ["지정석"] },
        { type: "S석", price: "77,000원", benefits: ["지정석"] },
      ],
      notice: [
        "본 공연은 만 7세 이상 입장 가능합니다.",
        "티켓 예매 후 취소/환불은 공연 7일 전까지 가능합니다.",
        "1인당 최대 4매까지 구매 가능합니다.",
        "신분증과 예매 확인서를 지참해주세요.",
      ],
    },
    "2": {
      id: 2,
      title: "K-POP 페스티벌 2025",
      artist: "Various Artists",
      date: "2025.02.20 (목)",
      time: "18:00",
      location: "인천 영종도 국제공연장",
      address: "인천광역시 중구 영종대로 424",
      image: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop",
      price: "150,000원~",
      status: "예매예정" as const,
      registrationDeadline: "2025.02.15",
      registrationStart: "2025.02.01",
      totalSeats: 10000,
      registeredUsers: 8500,
      description:
        "국내 최대 규모의 K-POP 페스티벌! 인기 아이돌 그룹들이 한자리에 모여 펼치는 환상의 무대를 만나보세요.",
      priceOptions: [
        { type: "스탠딩", price: "150,000원", benefits: ["자유석"] },
        { type: "지정석", price: "120,000원", benefits: ["지정석"] },
      ],
      notice: [
        "본 공연은 만 13세 이상 입장 가능합니다.",
        "스탠딩 구역은 선착순 입장입니다.",
        "1인당 최대 2매까지 구매 가능합니다.",
      ],
    },
  };

  return events[id as keyof typeof events] || events["1"];
};

export default function EventDetailPage() {
  const { id } = useParams({ from: "/events/$id" });
  const event = getEventById(id);

  const registrationProgress =
    (event.registeredUsers / event.totalSeats) * 100;

  return (
    <>
      <div className="border-b border-gray-200 bg-gray-50">
        <div className="container mx-auto px-4 py-3">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            이벤트 목록으로
          </Link>
        </div>
      </div>

      <div className="relative h-64 md:h-96 bg-gray-200 overflow-hidden">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <Badge className="mb-3 bg-blue-600 text-white border-blue-600">
              {event.status}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {event.title}
            </h1>
            <p className="text-lg">{event.artist}</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">이벤트 정보</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">날짜 및 시간</p>
                    <p className="text-gray-600">
                      {event.date} {event.time} 시작
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">{event.location}</p>
                    <p className="text-gray-600">{event.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <UsersIcon className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">사전 등록 현황</p>
                    <p className="text-gray-600">
                      {event.registeredUsers.toLocaleString()}명 /{" "}
                      {event.totalSeats.toLocaleString()}석
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${registrationProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-600 mt-1" />
                  <div>
                    <p className="font-medium">등록 기간</p>
                    <p className="text-gray-600">
                      {event.registrationStart} ~ {event.registrationDeadline}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">상세 설명</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">좌석 및 가격</h2>
              <div className="space-y-3">
                {event.priceOptions.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{option.type}</p>
                      <p className="text-sm text-gray-600">
                        {option.benefits.join(", ")}
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">
                      {option.price}
                    </p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-2xl font-bold mb-4">유의사항</h2>
              <ul className="space-y-2">
                {event.notice.map((item, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">가격</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {event.price}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">상태</span>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                    {event.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">등록 마감까지</p>
                  <p className="text-2xl font-bold">D-5</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">현재 등록률</p>
                  <p className="text-2xl font-bold">
                    {Math.round(registrationProgress)}%
                  </p>
                </div>
              </div>

              <Button className="w-full mb-3" size="lg" asChild>
                <Link to={`/events/${id}/register`}>사전 등록하기</Link>
              </Button>
              <Button variant="outline" className="w-full">
                알림 받기
              </Button>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p>
                    공정한 랜덤 큐 시스템으로 모두에게 평등한 기회를 제공합니다
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
