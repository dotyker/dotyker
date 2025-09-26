#! /bin/sh

if grep -q "Pi 4" /proc/cpuinfo; then
  EXTRAOPTS="--disable-gpu"
fi

# Read snap config values and export them as environment variables
export DOTYKER_CMS_URL=$(snapctl get cms.url)
export DOTYKER_SYSTEM_SOUND_WAITFORPULSESERVER=$(snapctl get system.sound.waitforpulseserver)
export DOTYKER_SYSTEM_SOUND_PULSESERVER=$(snapctl get system.sound.pulseserver)

echo "Launching DOTYKER with following config:
- DOTYKER_CMS_URL                            = $DOTYKER_CMS_URL
- DOTYKER_SYSTEM_SOUND_WAITFORPULSESERVER    = $DOTYKER_SYSTEM_SOUND_WAITFORPULSESERVER
- DOTYKER_SYSTEM_SOUND_PULSESERVER           = $DOTYKER_SYSTEM_SOUND_PULSESERVER"

if [ "$DOTYKER_SYSTEM_SOUND_WAITFORPULSESERVER" = "true" ]; then
  # Check if pulseserver is in format tcp:host:port
  if echo "$DOTYKER_SYSTEM_SOUND_PULSESERVER" | grep -qE '^tcp:[^:]+:[0-9]+$'; then
    PULSE_HOST=$(echo "$DOTYKER_SYSTEM_SOUND_PULSESERVER" | cut -d: -f2)
    PULSE_PORT=$(echo "$DOTYKER_SYSTEM_SOUND_PULSESERVER" | cut -d: -f3)
    echo "Waiting for PulseAudio server at $PULSE_HOST:$PULSE_PORT..."
    while ! nc -z "$PULSE_HOST" "$PULSE_PORT"; do
      echo "PulseAudio server not ready, waiting..."
      sleep 1
    done
    echo "PulseAudio server is ready."
  fi
fi

export PULSE_SERVER="$DOTYKER_SYSTEM_SOUND_PULSESERVER"

exec $SNAP/dotyker/dotyker \
	--enable-features=UseOzonePlatform \
	--ozone-platform=wayland \
	--disable-dev-shm-usage \
	--enable-wayland-ime \
	--no-sandbox $EXTRAOPTS
