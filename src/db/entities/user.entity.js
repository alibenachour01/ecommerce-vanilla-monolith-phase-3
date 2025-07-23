var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
// biome-ignore assist/source/organizeImports: <this rule is not applicable>
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Product } from "./product.entity";
let User = class User {
    id;
    email;
    password;
    role; // Default role is 'user'
    products;
    createdAt;
    updatedAt;
};
__decorate([
    PrimaryGeneratedColumn("uuid"),
    __metadata("design:type", String)
], User.prototype, "id", void 0);
__decorate([
    Column("varchar", { unique: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    Column("varchar"),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    Column("varchar", { default: "user" }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    OneToMany(() => Product, (product) => product.creator),
    __metadata("design:type", Array)
], User.prototype, "products", void 0);
__decorate([
    CreateDateColumn() // { default: 'CURRENT_TIMESTAMP' }
    ,
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn() // { default: 'CURRENT_TIMESTAMP' }
    ,
    __metadata("design:type", Date)
], User.prototype, "updatedAt", void 0);
User = __decorate([
    Entity("users")
], User);
export { User };
