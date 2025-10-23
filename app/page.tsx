import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // If user is logged in, redirect to dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-blue-600 mb-4">
            Finding Finland
          </h1>
          <p className="text-2xl text-gray-700 mb-2">
            Your Gamified Guide to Finnish Life
          </p>
          <p className="text-lg text-gray-600">
            Turn your Finnish immigration journey into an exciting adventure!
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Legal Quests</h3>
            <p className="text-gray-600">
              Navigate Finnish bureaucracy with step-by-step guidance for registration, permits, and documents.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-purple-100">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Social Quests</h3>
            <p className="text-gray-600">
              Connect with communities, join events, and build your network in Finland.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-pink-100">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Cultural Quests</h3>
            <p className="text-gray-600">
              Experience Finnish traditions from sauna to sisu, and embrace the Nordic lifestyle.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg border-2 border-orange-100">
            <div className="text-4xl mb-4">🍴</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Food Quests</h3>
            <p className="text-gray-600">
              Taste authentic Finnish cuisine and discover local favorites from korvapuusti to salmiakki.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/signup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition shadow-lg"
          >
            Start Your Journey
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-gray-50 text-blue-600 font-bold py-4 px-8 rounded-xl text-lg transition border-2 border-blue-600"
          >
            Log In
          </Link>
        </div>

        {/* Features List */}
        <div className="mt-12 bg-white p-8 rounded-2xl shadow-lg border-2 border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Why Finding Finland?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl mb-2">🎯</div>
              <h4 className="font-bold text-gray-900 mb-2">Track Progress</h4>
              <p className="text-sm text-gray-600">
                Complete quests, earn points, and level up as you settle into Finnish life.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">💡</div>
              <h4 className="font-bold text-gray-900 mb-2">Expert Tips</h4>
              <p className="text-sm text-gray-600">
                Get helpful guidance and practical advice for each step of your journey.
              </p>
            </div>
            <div>
              <div className="text-2xl mb-2">🏆</div>
              <h4 className="font-bold text-gray-900 mb-2">Compete & Connect</h4>
              <p className="text-sm text-gray-600">
                See how you rank on the leaderboard and celebrate your achievements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
