
let CanvasSizeX = 1000;
let CanvasSizeY = 1000;

let AspectRatio = CanvasSizeX / CanvasSizeY;

let ViewCenterX = 0.0;
let ViewCenterY = 0.0;

let ViewSizeY = 7.0;
let ViewSizeX = ViewSizeY / AspectRatio;

let ViewMinX = ViewCenterX - 0.5*ViewSizeX;
let ViewMinY = ViewCenterY - 0.5*ViewSizeY;
let ViewMaxX = ViewCenterX + 0.5*ViewSizeX;
let ViewMaxY = ViewCenterY + 0.5*ViewSizeY;

function ToDrawCoordinates(X, Y)
{
  let ScaleX = CanvasSizeX / ViewSizeX;
  let ScaleY = CanvasSizeY / ViewSizeY;

  let OffsetX = -0.5 * ViewCenterX * ScaleX;
  let OffsetY = -0.5 * ViewCenterY * ScaleY;

  let DrawX = X * ScaleX + OffsetX;
  let DrawY = Y * ScaleY + OffsetY;

  return {X: DrawX, Y: DrawY};
}

function ToDrawScale(X)
{
  let Scale = CanvasSizeY / ViewSizeY;
  let DrawX = X * Scale;

  return DrawX;
}

function DrawCircle(X, Y, Radius)
{
  let DrawP = ToDrawCoordinates(X, Y);
  let DrawR = ToDrawScale(Radius);

  stroke(0);
  strokeWeight(0);

  circle(DrawP.X, DrawP.Y, DrawR);
}

function DrawVector(FromX, FromY, ToX, ToY)
{
  let X = (ToX - FromX);
  let Y = (ToY - FromY);

  let MaxMagnitude = 0.1;
  let Magnitude    = sqrt(X*X + Y*Y);

  if (Magnitude > 1e-5)
  {
    let DrawMagnitude = min(Magnitude, MaxMagnitude);

    let NormalX = X / Magnitude;
    let NormalY = Y / Magnitude;

    let TangentX = -NormalY;
    let TangentY =  NormalX;

    let R = (0.2 + min(0.8, Magnitude / (30*MaxMagnitude))) * 255.0;
    let G = (0.2 + min(0.8, Magnitude / (10*MaxMagnitude))) * 255.0;
    let B = (0.2 + min(0.8, Magnitude / (50*MaxMagnitude))) * 255.0;

    stroke(color(R, G, B));
    strokeWeight(ToDrawScale(0.05));

    ToX = FromX + NormalX*DrawMagnitude;
    ToY = FromY + NormalY*DrawMagnitude;

    let DrawFrom = ToDrawCoordinates(FromX, FromY);
    let DrawTo   = ToDrawCoordinates(ToX,   ToY);

    line(
      DrawFrom.X,
      DrawFrom.Y,
      DrawTo.X,
      DrawTo.Y
    );

    stroke(0);
    strokeWeight(0);
    fill(color(R, G, B));

    X0 = ToX - 0.05*TangentX;
    Y0 = ToY - 0.05*TangentY;

    X1 = ToX + 0.05*TangentX;
    Y1 = ToY + 0.05*TangentY;

    X2 = ToX + 0.05*NormalX;
    Y2 = ToY + 0.05*NormalY;

    DrawP0 = ToDrawCoordinates(X0, Y0);
    DrawP1 = ToDrawCoordinates(X1, Y1);
    DrawP2 = ToDrawCoordinates(X2, Y2);

    triangle(
      DrawP0.X, DrawP0.Y,
      DrawP1.X, DrawP1.Y,
      DrawP2.X, DrawP2.Y
    );
  }
}

function setup() {
  createCanvas(CanvasSizeX, CanvasSizeY, WEBGL);
}

function CalculateElectricField(ParticleX, ParticleY, X, Y, Charge)
{
  let DeltaX = ParticleX - X;
  let DeltaY = ParticleY - Y;

  let Distance = sqrt(DeltaX*DeltaX + DeltaY*DeltaY);

  Distance = max(Distance, 0.0001);

  let InvDistanceCubed = 1.0 / (Distance * Distance * Distance);

  let DirectionX = DeltaX / Distance;
  let DirectionY = DeltaY / Distance;

  let Ex = Charge * DirectionX * InvDistanceCubed;
  let Ey = Charge * DirectionY * InvDistanceCubed;

  return {X: Ex, Y: Ey};
}

let Time = 0.0;

function draw() {
  background(0);

  // Electron

  let ElectronX = +cos(0.0002 * PI * Time) * 1.5;
  let ElectronY = +sin(0.0002 * PI * Time) * 1.5;

  fill(color(123, 145, 232));
  DrawCircle(ElectronX, ElectronY, 0.1);

  let ProtonX = -cos(0.0002 * PI * Time) * 1.5;
  let ProtonY = -sin(0.0002 * PI * Time) * 1.5;

  fill(color(232, 145, 123));
  DrawCircle(ProtonX, ProtonY, 0.1);

  // Electric field

  for (let Y = -3.0; Y <= 3.0; Y += 0.4)
  {
    for (let X = -3.0; X <= 3.0; X += 0.4)
    {
      let E0 = CalculateElectricField(ElectronX, ElectronY, X, Y, -1.0);
      let E1 = CalculateElectricField(ProtonX,   ProtonY,   X, Y, +1.0);

      let TotalEX = E0.X + E1.X;
      let TotalEY = E0.Y + E1.Y;

      DrawVector(
        X,
        Y,
        X + TotalEX,
        Y + TotalEY
      )
    }
  }

  Time += deltaTime;
}
