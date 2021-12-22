export class SignupRequestOrg {
    "userOrgName": string
    "userOrgID": string
    "userOrgAdminpassword": string
    "userOrgAdminconfpass": string
    "userOrgAdminemail": string
    "fullName": string
    "orgPhone": string
    "recaptcha": string

    public constructor(init?: Partial<SignupRequestOrg>) {
        Object.assign(this, init)
    }
}
