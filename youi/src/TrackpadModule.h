
#ifndef _TRACKPAD_MODULE_H_
#define _TRACKPAD_MODULE_H_

#include <youireact/NativeModule.h>

#include <event/YiEventHandler.h>
#include <youireact/modules/EventEmitter.h>

namespace yi
{
namespace react
{
class ReactComponent;

class YI_RN_MODULE(TrackpadModule, EventEmitterModule), public CYIEventHandler
{
public:
    TrackpadModule();
    virtual ~TrackpadModule();

    YI_RN_EXPORT_NAME(TrackpadModule);

protected:
    virtual bool HandleEvent(const std::shared_ptr<CYIEventDispatcher> &pDispatcher, CYIEvent *pEvent) override;
    virtual void StartObserving() override;
    virtual void StopObserving() override;
};
} // namespace react
} // namespace yi
#endif // _TRACKPAD_MODULE_H_
