import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // CEK DUMMY AUTH
  const dummyAuth = request.cookies.get('dummy-auth')
  
  if (dummyAuth) {
    if (request.nextUrl.pathname.startsWith('/login')) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // Jika belum login dummy
  if (request.nextUrl.pathname.startsWith('/favorites')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}
