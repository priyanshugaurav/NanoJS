#include "../../include/runtime/EventLoop.h"
#include <thread>
#include <iostream>

using namespace std;

void EventLoop::schedule(function<void()> callback, int delayMs)
{
    lock_guard<mutex> lock(queueMutex);
    Task task;
    task.callback = callback;
    task.scheduledTime = chrono::steady_clock::now() + chrono::milliseconds(delayMs);
    taskQueue.push(task);
    cv.notify_one();
}

void EventLoop::processNext()
{
    unique_lock<mutex> lock(queueMutex);
    if (taskQueue.empty())
        return;
    auto now = chrono::steady_clock::now();
    auto& task = taskQueue.top();
    if (task.scheduledTime <= now)
    {
        auto callback = task.callback;
        taskQueue.pop();
        lock.unlock();
        try
        {
            callback();
        }
        catch (exception& e)
        {
            cerr << "Uncaught error in async callback: " << e.what() << endl;
        }
    }
}

void EventLoop::runUntilEmpty()
{
    while (true)
    {
        unique_lock<mutex> lock(queueMutex);
        if (taskQueue.empty())
            break;
        lock.unlock();
        processNext();
        this_thread::sleep_for(chrono::milliseconds(1));
    }
}

bool EventLoop::hasTasksScheduled()
{
    lock_guard<mutex> lock(queueMutex);
    return !taskQueue.empty();
}