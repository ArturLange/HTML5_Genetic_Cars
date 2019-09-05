export interface WorldDefinition {
    gravity: any;
    doSleep: boolean;
    floorseed: string;
    maxFloorTiles: number;
    mutable_floor: boolean;
    motorSpeed: number;
    box2dfps: number;
    max_car_health: number;
    tileDimensions: TileDimensions;
}

interface TileDimensions {
    width: number;
    height: number;
}
