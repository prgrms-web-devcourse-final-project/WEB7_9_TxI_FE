import { Link } from '@tanstack/react-router'
import { Ticket } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6 bg-gray-50/30">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-4 md:gap-1">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">WaitFair</span>
            </Link>
            <p className="text-sm text-gray-600">공정하고 투명한 티켓팅의 새로운 기준</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-gray-900">지원</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>
                <Link to="/faq" className="hover:text-blue-600 transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2 text-gray-900">Built by Team TXI</h4>
            <div className="text-sm text-gray-600">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 whitespace-nowrap">
                  <span className="font-medium text-gray-900">Backend </span>
                  @LeeMinwoo155, @gksdud1109, @kimeunkyoungg, @No-366, @thatgirls00
                </div>
                <div className="flex-shrink-0 whitespace-nowrap">
                  <span className="font-medium text-gray-900">Frontend </span>
                  @jiji-hoon96
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          © 2025 WaitFair. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
