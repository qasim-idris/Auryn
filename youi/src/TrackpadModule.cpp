#include "TrackpadModule.h"
#include <event/YiTrackpadEvent.h>
#include <framework/YiApp.h>
#include <framework/YiAppContext.h>
#include <scenetree/YiSceneManager.h>

using namespace yi::react;

YI_RN_INSTANTIATE_MODULE(TrackpadModule, EventEmitterModule);

TrackpadModule::TrackpadModule() {
    std::vector<std::string> events = { "TrackpadDown", "TrackpadMove", "TrackpadUp" };
    SetSupportedEvents(std::move(events));
}

TrackpadModule::~TrackpadModule()
{
    StopObserving();
}

void TrackpadModule::StartObserving()
{
    auto pSceneManager = CYIAppContext::GetInstance()->GetApp()->GetSceneManager();
    pSceneManager->AddGlobalEventListener(CYIEvent::Type::TrackpadDown, this);
    pSceneManager->AddGlobalEventListener(CYIEvent::Type::TrackpadMove, this);
    pSceneManager->AddGlobalEventListener(CYIEvent::Type::TrackpadUp, this);
}

void TrackpadModule::StopObserving()
{
    auto pSceneManager = CYIAppContext::GetInstance()->GetApp()->GetSceneManager();
    pSceneManager->RemoveGlobalEventListener(CYIEvent::Type::TrackpadDown, this);
    pSceneManager->RemoveGlobalEventListener(CYIEvent::Type::TrackpadMove, this);
    pSceneManager->RemoveGlobalEventListener(CYIEvent::Type::TrackpadUp, this);
}


bool TrackpadModule::HandleEvent(const std::shared_ptr<CYIEventDispatcher> &pDispatcher, CYIEvent *pEvent)
{
    YI_UNUSED(pDispatcher);

    bool handled = false;
    CYIEvent::Type type = pEvent->GetType();

    if (pEvent->IsTrackpadEvent())
    {
        if (type == CYIEvent::Type::TrackpadDown)
        {
            EmitEvent("TrackpadDown", folly::dynamic::object());
        }
        else if (type == CYIEvent::Type::TrackpadMove)
        {
            EmitEvent("TrackpadMove", folly::dynamic::object());
        }
        else if (type == CYIEvent::Type::TrackpadUp)
        {
            EmitEvent("TrackpadUp", folly::dynamic::object());
        }
    }

    return handled;
}
