import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Ticket, Calendar, MapPin, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";

export default function MyTicketsPage() {
  const [tickets] = useState([
    {
      id: 1,
      title: "2025 서울 뮤직 페스티벌",
      date: "2025.03.15",
      location: "잠실 올림픽 주경기장",
      status: "confirmed",
      image:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1200&h=600&fit=crop",
    },
  ]);

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">내 티켓</h1>

        <Tabs defaultValue="active" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="active">진행 예정</TabsTrigger>
            <TabsTrigger value="past">지난 티켓</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            <div className="grid lg:grid-cols-2 gap-6">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="overflow-hidden">
                  <div className="aspect-video relative overflow-hidden bg-gray-200">
                    <img
                      src={ticket.image}
                      alt={ticket.title}
                      className="object-cover w-full h-full"
                    />
                    <Badge className="absolute top-3 right-3 bg-blue-600/20 text-blue-600 border-blue-600/30">
                      확정
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-4">{ticket.title}</h3>
                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{ticket.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{ticket.location}</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button className="flex-1" asChild>
                        <Link to="/events/$id" params={{ id: String(ticket.id) }}>
                          티켓 보기
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="past">
            <div className="text-center py-12 text-gray-600">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>지난 티켓이 없습니다</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
