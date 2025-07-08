import {Campground} from "./campground";

export interface AnnouncementDto {
    id: number;
    title: string;
    subtitle: string | null;
    content: string;
    expirationDate: string | null;
    messageType: string;
    forceGlobal: boolean;
    pinnedPriority: number | null;
    createdAt: Date;
    createdBy: string | null;
    updatedAt: Date | null;
    updatedBy: string | null;
    campgrounds: Campground | null;
}
