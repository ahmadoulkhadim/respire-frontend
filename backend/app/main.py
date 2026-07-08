from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Respire API",
    description="API for respiratory health monitoring",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import routes
from app.routes import auth, users, profil, cohortes, capteurs, data

# Include routes
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(profil.router, prefix="/api/users", tags=["profil"])
app.include_router(cohortes.router, prefix="/api/cohortes", tags=["cohortes"])
app.include_router(capteurs.router, prefix="/api/capteurs", tags=["capteurs"])
app.include_router(data.router, prefix="/api/data", tags=["data"])


@app.get("/", tags=["health"])
async def root():
    return {"message": "Respire API is running"}


@app.get("/health", tags=["health"])
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

