import { getSession } from 'next-auth/react';
import { NextResponse } from 'next/server';
import { USER_TYPE_ADMIN } from '../components';

export async function middleware(req) {
  // FIXME next-auth does not support Next 12 middlewares
  /*const session = await getSession({ req });

  if(req.url.startsWith('/administration')) {
    console.log(session)
    if(!session || session.userType !== USER_TYPE_ADMIN) {
      //return NextResponse.redirect('/connexion');
    }
  }*/

  return NextResponse.next();
}
