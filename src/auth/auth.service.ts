import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {
    signin() {
        return {
            message: "hello i have signed in"
        }
    }

    signup() {
        return {
            message: "hello i have signed up"
        }
    }
}